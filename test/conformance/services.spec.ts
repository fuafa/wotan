import 'reflect-metadata';
import { test } from 'ava';
import { DefaultCacheManager } from '../../src/services/default/cache-manager';
import { CacheIdentifier, WeakCacheIdentifier, FileSystem, CacheManager, Resolver } from '../../src/types';
import { NodeDirectoryService } from '../../src/services/default/directory-service';
import * as os from 'os';
import { NodeRuleLoader } from '../../src/services/default/rule-loader-host';
import { Rule } from '../../src/rules/no-debugger';
import * as path from 'path';
import { ConsoleMessageHandler } from '../../src/services/default/message-handler';
import { ConfigurationError } from '../../src/error';
import { Container } from 'inversify';
import { NodeResolver } from '../../src/services/default/resolver';
import { NodeFileSystem } from '../../src/services/default/file-system';
import { CachedFileSystem } from '../../src/services/cached-file-system';
import { NodeFormatterLoader } from '../../src/services/default/formatter-loader-host';
import { Formatter } from '../../src/formatters/json';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as ts from 'typescript';

test('CacheManager', (t) => {
    const cm = new DefaultCacheManager();
    testWithIdentifier(new CacheIdentifier('test'));
    testWithIdentifier(new WeakCacheIdentifier('test'));

    function testWithIdentifier(id: CacheIdentifier<object, number>) {
        let cache = cm.get(id);
        t.is(cache, undefined);
        cache = cm.create(id);
        t.not(cache, undefined);
        t.is(cm.get(id), cache);
        t.is(cm.create(id), cache);
        t.is(cm.get(id), cache);
        const key = {};
        t.is(cache.get(key), undefined);
        t.is(cache.has(key), false);
        cache.delete(key);
        cache.set(key, 1);
        t.is(cache.get(key), 1);
        t.is(cache.has(key), true);
        cache.set(key, 2);
        t.is(cache.get(key), 2);
        t.is(cache.has(key), true);
        cache.delete(key);
        t.is(cache.get(key), undefined);
        t.is(cache.has(key), false);
        cache.set(key, 3);
        t.is(cache.get(key), 3);
        t.is(cache.has(key), true);
        cache.set({}, 4);
        t.is(cache.get(key), 3);
        cache.clear();
        t.is(cache.get(key), undefined);
        t.is(cache.has(key), false);
    }
});

test('DirectoryService', (t) => {
    const service = new NodeDirectoryService();
    t.is(service.getCurrentDirectory(), process.cwd());
    t.is(service.getHomeDirectory(), os.homedir());
});

test('RuleLoaderHost', (t) => {
    const loader = new NodeRuleLoader();
    t.is(loader.loadCoreRule('no-debugger'), Rule);
    t.is(loader.loadCoreRule('fooBarBaz'), undefined);
    t.throws(() => loader.loadCoreRule('../../test/fixtures/invalid'));

    t.is(loader.loadCustomRule('no-debugger', path.resolve('src/rules')), Rule);
    t.is(loader.loadCustomRule('fooBarBaz', process.cwd()), undefined);
    t.throws(() => loader.loadCustomRule('invalid', path.resolve('test/fixtures')));
});

test('MessageHandler', (t) => {
    const logger = new ConsoleMessageHandler();
    const otherLogger = new ConsoleMessageHandler();
    const {log, warn, error} = console;

    const logOutput: string[] = [];
    const warnOutput: string[] = [];
    const errorOutput: any[] = [];

    console.log = (message: string) => {
        logOutput.push(message);
    };
    console.warn = (message: string) => {
        warnOutput.push(message);
    };
    console.error = (message) => {
        errorOutput.push(message);
    };

    logger.log('foo');
    logger.log('bar');
    logger.warn('something is deprecated');
    logger.warn('something requires type information');
    logger.warn('something is deprecated');
    logger.warn('does anyone even test console output?');
    otherLogger.warn('something is deprecated');
    otherLogger.warn('something is deprecated');
    logger.log('baz');
    logger.error(new ConfigurationError('hello?'));
    const someError = new Error('not a ConfigurationError');
    logger.error(someError);

    console.log = log;
    console.warn = warn;
    console.error = error;

    t.deepEqual(logOutput, ['foo', 'bar', 'baz']);
    t.deepEqual(warnOutput, [
        'something is deprecated',
        'something requires type information',
        'does anyone even test console output?',
        'something is deprecated',
    ]);
    t.is(errorOutput.length, 2);
    t.is(errorOutput[0], 'hello?');
    t.is(errorOutput[1], someError);
});

test('Resolver', (t) => {
    const container = new Container();
    container.bind(FileSystem).to(NodeFileSystem);
    container.bind(CachedFileSystem).toSelf();
    container.bind(CacheManager).to(DefaultCacheManager);
    const resolver = container.resolve(NodeResolver);
    t.is(resolver.resolve('tslib', process.cwd(), ['.js']), require.resolve('tslib'));
    t.is(resolver.resolve('tslib', '/', ['.js'], module.paths), require.resolve('tslib'));
    t.is(resolver.resolve('./no-debugger', path.resolve('src/rules'), ['.ts']), path.resolve('src/rules/no-debugger.ts'));

    const tslib = require('tslib'); // tslint:disable-line
    t.is(resolver.require(require.resolve('tslib')), tslib);
    t.not(resolver.require(require.resolve('tslib'), {cache: false}), tslib);
});

test('FormatterLoaderHost', (t) => {
    const container = new Container();
    container.bind(FileSystem).to(NodeFileSystem);
    container.bind(CachedFileSystem).toSelf();
    container.bind(CacheManager).to(DefaultCacheManager);
    container.bind(Resolver).to(NodeResolver);
    const loader = container.resolve(NodeFormatterLoader);
    t.is(loader.loadCoreFormatter('json'), Formatter);
    t.is(loader.loadCoreFormatter('fooBarBaz'), undefined);
    t.throws(() => loader.loadCoreFormatter('../../test/fixtures/invalid'));

    t.is(loader.loadCustomFormatter('./src/formatters/json', process.cwd()), Formatter);
    t.is(loader.loadCustomFormatter('fooBarBaz', process.cwd()), undefined);
    t.is(
        loader.loadCustomFormatter('custom-formatter', path.resolve('test/fixtures')),
        require('../fixtures/node_modules/custom-formatter').Formatter, // tslint:disable-line
    );
    t.throws(() => loader.loadCustomFormatter('./test/fixtures/invalid', process.cwd()));
});

let tmpDir: string;
test.before(() => {
    tmpDir = fs.mkdtempSync('fs-test');
});

test('FileSystem', (t) => {
    const fileSystem = new NodeFileSystem();
    t.is(fileSystem.normalizePath('C:\\foo\\bar/baz'), getCanonicalFileName('C:/foo/bar/baz'));
    t.is(fileSystem.normalizePath('/foo/bar/baz'), getCanonicalFileName('/foo/bar/baz'));
    t.is(fileSystem.normalizePath('/Foo/Bar/Baz'), getCanonicalFileName('/Foo/Bar/Baz'));

    const dir = path.posix.join(tmpDir, 'sub');
    const deepDir = path.posix.join(dir, 'dir');
    t.throws(() => fileSystem.createDirectory(deepDir));
    t.throws(() => fileSystem.createDirectory(tmpDir));
    fileSystem.createDirectory(dir);
    fileSystem.createDirectory(deepDir);
    t.true(fs.existsSync(dir));
    t.true(fs.existsSync(deepDir));

    const f = path.posix.join(dir, 'somefile');
    t.throws(() => fileSystem.writeFile(dir, ''));
    t.false(fs.existsSync(f));
    fileSystem.writeFile(f, 'some content');
    t.true(fs.existsSync(f));
    t.is(fs.readFileSync(f, 'utf8'), 'some content');
    t.is(fileSystem.readFile(f), 'some content');
    t.throws(() => fileSystem.readFile(path.posix.join(dir, 'non-existent')));
    t.throws(() => fileSystem.readFile(dir));

    fs.writeFileSync(f, new Buffer([0xFF, 0xFE, 0x68, 0x00, 0x61, 0x00, 0x6C, 0x00, 0x6C, 0x00, 0x6F, 0x00, 0x3F, 0x00]));
    t.is(fileSystem.readFile(f), 'hallo?');
    fs.writeFileSync(f, '\uFEFFhallo?');
    t.is(fileSystem.readFile(f), '\uFEFFhallo?');
    fs.writeFileSync(f, new Buffer([0xFE, 0xFF, 0x00, 0x68, 0x00, 0x61, 0x00, 0x6C, 0x00, 0x6C, 0x00, 0x6F, 0x00, 0x3F]));
    t.is(fileSystem.readFile(f), 'hallo?');

    let stats = fileSystem.stat(dir);
    t.true(stats.isDirectory());
    t.false(stats.isFile());
    stats = fileSystem.stat(f);
    t.false(stats.isDirectory());
    t.true(stats.isFile());

    fileSystem.deleteFile(f);
    t.false(fs.existsSync(f));
    t.throws(() => fileSystem.stat(f));

    function getCanonicalFileName(file: string) {
        return ts.sys.useCaseSensitiveFileNames ? file : file.toLowerCase();
    }
});

test.after.always(() => {
    rimraf.sync(tmpDir);
});
