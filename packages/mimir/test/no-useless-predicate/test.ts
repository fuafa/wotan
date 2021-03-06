export {};

declare function get<T>(): T;

if (typeof (get<Function>()) === 'function') {}
if (typeof (get<() => void>()) === 'function') {}
if (typeof (get<new() => any>()) === 'function') {}
if (get<any>()) {}
if (get<unknown>()) {}
if (get<never>()) {}
if ((typeof 1 === 'number')) {}
if ((get<Record<string, Function>>().foo)) {}
if (!(get<Record<string, Function>>().foo)) {}
while (typeof get<any>() === 'symbol') {}
while (typeof get<unknown>() === 'symbol') {}
while (typeof get<never>() === 'symbol') {}
while (typeof get<{}>() === 'number') ;
while (typeof get<{}>() == 'object') ;
while (typeof get<{}>() == 'undefined') ;
while (typeof get<{a: number} & {b: string}>() === 'object') ;
while (typeof get<(() => void) & {prop: string}>() === 'function') ;
while (typeof get<{length: number} & string>() === 'string') ;
while (typeof get<{length: number} & string>() === 'number') ;
while (typeof get<{length: number} & string>() === 'object') ; // TODO this should probably be considered always falsy
while (typeof get<{length: number} & string>() === 'undefined') ;
while (typeof get<{toString(): string}>() == 'number') ; // TODO this is actually valid, but needs to check type assignability
while (typeof get<null>() == 'null');
do {} while (typeof get<Function>() === 'object');
for (; typeof get<object>() === 'object';) ;
while ('foo' !== undefined && 'bar' == null) {}
while (get<number>() + get<number>());

true ? 'foo' : 'bar';
1 === undefined ? 'bar' : 'foo';

+0;

declare let v: number;
if (v) {}
if (+v) {}

v = 1;

typeof v === get<string>();
typeof get<number | string>() === 'object';
typeof get<number | string | Array<any>>() === 'object';
typeof Math === 'object';
typeof undefined === undefined;
typeof undefined == null;
'foo' === undefined;
'bar' === null;
get<'foo' | undefined>() == null;
get<'foo' | null>() == null;
get<'foo' | undefined>() == undefined;
get<'foo' | null>() == undefined;
get<'foo' | undefined>() === null;
get<'foo' | null>() === undefined;
get<undefined>() === undefined;
null === get<null>();
undefined == get<null>();
get<undefined>() == null;

!get<1>();
!get<0>();
!get<number>();
!!get<boolean>();
!get<string>();
!!get<'foo'>();
!!get<true>();
!get<{}>();
!!get<false>()
!get<{foo: 'bar'}>();

for (;;) break;
while (true) break;

function test<T>(param: T) {
    param === undefined;
    typeof param === 'string';
    typeof param === 'boolean';
    typeof param === 'object';
}

function test2<T extends boolean, U extends any>(param?: T, param2?: U) {
    param === undefined;
    typeof param === 'string';
    typeof param === 'boolean';
    typeof param === 'object';

    param2 === undefined;
    typeof param2 === 'string';
    typeof param2 === 'boolean';
    typeof param2 === 'object';
}

function test3<T extends Record<'foo', string>, K extends keyof T>(v: T, k: K) {
    v[k] === undefined;
    typeof v[k] === undefined;
    typeof v[k] === 'string';
    typeof v[k] === 'symbol';
    !v[k];
}

function test4<T extends Record<'foo', string>>(v: T, k: 'foo') {
    v[k] === undefined;
    typeof v[k] === undefined;
    typeof v[k] === 'string';
    typeof v[k] === 'symbol';
    !v[k];
}

function test5<K extends 'foo'>(v: Record<'foo', string>, k: K) {
    v[k] === undefined;
    typeof v[k] === undefined;
    typeof v[k] === 'string';
    typeof v[k] === 'symbol';
    !v[k];
}

switch (get<boolean>()) {
    case true:
    case false:
    case undefined:
    case null:
}

switch (typeof get<boolean>()) {
    case 'string':
    case 'object':
    case undefined:
    case 'boolean':
}

switch (typeof get<boolean | string>()) {
    case 'string':
    case 'object':
    case undefined:
    case 'boolean':
}

switch ('string') {
    case typeof '':
    case typeof 1:
    case typeof get<{}>():
    default:
}

enum E {
    Foo,
    Bar,
    Baz,
}

const enum CE {
    Foo,
    Bar,
    Baz,
}

const enum CSE {
    Foo = '',
    Bar = 'bar',
}

const enum E2 {
    Bar = 1,
    Baz = 2,
}

!E.Foo;
!E.Bar;
!E.Baz;
!CE.Foo;
!CE.Bar;
!CE.Baz;
!CSE.Foo;
!CSE.Bar;

!get<E.Foo | CE.Foo | CSE.Foo>();
!get<E.Foo | CE.Foo | CSE.Bar>();
!get<E.Bar | CE.Bar | CSE.Bar>();
!get<E2>();

const TypeOfString = 'string';

typeof 1 === TypeOfString;

const enum TypeOf {
    String = 'string',
    Number = 'number',
}

typeof 1 === TypeOf.Number;
typeof 1 === TypeOf.String;

typeof true === get<TypeOf>();

declare let arr: Array<true>;
typeof arr[0] === 'boolean';
typeof arr[0] === 'undefined';
typeof arr[0] === 'number';
!arr[0];
arr[0] === undefined;
!arr.length;
!arr['length'];
!arr[Symbol.iterator];

declare let tuple: [Date];
typeof tuple[0] === 'object';
typeof tuple[0] === 'undefined';
typeof tuple[0] === 'number';
!tuple[0];
tuple[0] === undefined;
!tuple.length;
!tuple['length'];

declare let indexer: { [s: string]: true; foo: true; bar: true };
!indexer.foo;
!indexer.bar;
!indexer.baz;
!indexer[get<'foo'>()];
!indexer[get<'foo' | 'bar'>()];
!indexer[get<'foo' | 'baz'>()];
!indexer[get<string>()];

'foo' in get<{}>();
'foo' in get<{foo?: string}>();
'foo' in get<{foo: string | undefined}>();
'foo' in get<{[x: string]: string}>();
'foo' in get<{foo: string} | {foo?: number}>();
'foo' in get<{foo: string} | Record<string, string>>();

get<'foo' | 'bar'>() in get<{foo: string}>();
get<'foo' | 'bar'>() in get<{foo: string, bar: number}>();
get<string>() in get<{foo: string}>();
get<string>() in get<{[x: string]: string}>();

0 in get<[unknown]>();
get<0 | 'length'>() in get<[unknown]>();
0 in (get<Record<string, [unknown]>>().foo);

Symbol.iterator in [];

if ('length' in []) {}

'a' === 'a';
'a' !== 'a';
0 == 0;
true === true;
false === false;
get<null>() === get<null>();
get<undefined>() === get<undefined>();
'a' === get<string>();
get<'a' | 'b'>() === 'a';
get<'a' | 'b'>() === get<'a' | 'b'>();
get<Record<string, 'a'>>().foo === 'a';
get<any>() === get<any>();

type Brand<T> = T & {__brand: never};
get<Brand<'a'>>() === get<Brand<'a'>>();
