export {};
declare const x: any, y: any;

switch (x) {
    case 1:
    case 2:
    case 3:
        console.log('few');
        break;
    case 0: {
        console.log('none');
        break;
    }
    default:
        console.log('many');
}

switch (x) {
    case 'foo':
        console.log('foo');
        break;
    case 'bar':
        if (y) {
            console.log('bar');
            break;
        } else
            console.log('not bar');
    case 'baz':
        for (const c of x) {
            console.log('baz');
            break;
        }
    case 'bas':
        x;
    default:
}

switch (x) {
    case 1:
        // comment
    case 2:
        'statement';
        // comment
    case 3:
        'statement';
        // falls through
    case 4:
        'statement';
        //fallthrough: this is intended
    case 5:
        'statement';
        // fall through is necessary here
        // and here is some more explanation: ...
        /* and so on */
    case 6:
        'statement';
        // plenty
        // of
        // comments
        /* fallsthrough */
    default:
}

if (x) switch (x) {case 1: 'foo'; case 2: 'bar'}
if (x) {
    switch (x) {case 1: 'foo'; case 2: 'bar'}
} switch (x) {case 1: 'foo'; case 2: 'bar'} "foo"; switch (x) {case 1: 'foo'; case 2: 'bar'} /*
 switch (x)
*/ switch (x) {case 1: 'foo'; case 2: 'bar'}
label: switch (x) {case 1: 'foo'; case 2: 'bar'}

switch
(x) {case 1: 'foo'; case 2: 'bar'}
switch /* foo */ (x) {case 1: 'foo'; case 2: 'bar'}
switch // foo
(x) {case 1: 'foo'; case 2: 'bar'}

x./* comment */switch

let foo: {
    switch(x): void;
} = { switch(x) {}};
