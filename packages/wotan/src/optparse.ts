import debug = require('debug');
import { ConfigurationError } from '@fimbul/ymir';
const log = debug('wotan:optparse');

export namespace OptionParser {
    export type MismatchCallback = (type: string) => void;

    export type ParseFunction<T> = (value: any, report: MismatchCallback) => T;

    export type ParsedOptions<T extends Record<string, ParseFunction<any>>> = {
        [K in keyof T]: ReturnType<T[K]>
    };

    export interface ParseConfig {
        validate?: boolean;
        context: string;
        exhaustive?: boolean;
    }

    export function parse<T extends Record<string, ParseFunction<any>>>(
        options: Record<string, any> | undefined,
        specs: T,
        config: ParseConfig,
    ): ParsedOptions<T> {
        const result: Record<string, any> = {};
        let name: string;
        for (name of Object.keys(specs))
            result[name] = specs[name](options && options[name], reportMismatch);
        if (config.exhaustive && options)
            for (const key of Object.keys(options))
                if (specs[key] === undefined)
                    report(`Unexpected option '${key}'.`);
        return <ParsedOptions<T>>result;

        function reportMismatch(type: string) {
            report(`Expected a value of type '${type}' for option '${name}'.`);
        }

        function report(message: string) {
            message = config.context + ': ' + message;
            if (config.validate)
                throw new ConfigurationError(message);
            log(message);
        }
    }

    export namespace Transform {
        export function withDefault<T>(parseFn: ParseFunction<T | undefined>, defaultValue: T): ParseFunction<T> {
            return (value, report) => {
                const result = parseFn(value, report);
                return result === undefined ? defaultValue : result;
            };
        }

        export function noDefault<T>(parseFn: ParseFunction<T>): ParseFunction<T | undefined> {
            return (value, report) => {
                return value === undefined ? undefined : parseFn(value, report);
            };
        }

        export function map<T extends ReadonlyArray<U> | undefined, U, V>(
            parseFn: ParseFunction<T>,
            cb: (item: U) => V,
        ): ParseFunction<{[K in keyof T]: V}> {
            return (value, report) => {
                const result = parseFn(value, report);
                return <any>(result === undefined ? undefined : result.map(cb));
            };
        }

        export function transform<T, U>(parseFn: ParseFunction<T>, cb: (value: T) => U): ParseFunction<U> {
            return (value, report) => {
                return cb(parseFn(value, report));
            };
        }
    }

    export namespace Factory {
        type PrimitiveName = 'string' | 'number' | 'boolean';
        type PrimitiveMap<T extends PrimitiveName> =
            T extends 'string'
                ? string
                : T extends 'number'
                    ? number
                    : boolean;

        export function parsePrimitive<T extends PrimitiveName[]>(...types: T): ParseFunction<PrimitiveMap<T[number]> | undefined> {
            return (value, report) => {
                for (const type of types)
                    if (typeof value === type)
                        return value;
                if (value !== undefined)
                    report(types.join(' | '));
                return;
            };
        }

        export function parsePrimitiveOrArray<T extends PrimitiveName>(type: T): ParseFunction<ReadonlyArray<PrimitiveMap<T>> | undefined> {
            return (value, report) => {
                if (Array.isArray(value) && value.every((v) => typeof v === type))
                    return value;
                if (typeof value === 'string')
                    return [value];
                if (value !== undefined)
                    report('string | string[]');
                return;
            };
        }
    }
}
