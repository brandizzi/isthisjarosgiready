var models = require('../models.js');
var JarInfo = models.JarInfo;
var POM = models.POM;
var deepEqual = require('deep-equal');

assert = (condition, msg) => {
    if (!condition) {
        throw new Error(msg || "Assertion failed");
    }
}


// test add filename

var ji = new JarInfo();
ji.addFilename('a');
assert(deepEqual(ji.filenames, ['a']));
ji.addFilename('b');
assert(deepEqual(ji.filenames, ['a', 'b']));
ji.addFilename('a');
assert(deepEqual(ji.filenames, ['a', 'b']));

// test add url

var ji = new JarInfo();
ji.addURL('a');
assert(deepEqual(ji.urls, ['a']));
ji.addURL('b');
assert(deepEqual(ji.urls, ['a', 'b']));
ji.addURL('a');
assert(deepEqual(ji.urls, ['a', 'b']));

// test add pom

var ji = new JarInfo();
ji.addPOM(new POM('g', 'a', 'v'));
assert(deepEqual(ji.poms, [new POM('g', 'a', 'v')]));
ji.addPOM(new POM('g2', 'a2', 'v2'));

assert(deepEqual(ji.poms, [new POM('g', 'a', 'v'), new POM('g2', 'a2', 'v2')]));
ji.addPOM(new POM('g', 'a', 'v'));
assert(deepEqual(ji.poms, [new POM('g', 'a', 'v'), new POM('g2', 'a2', 'v2')]));

// test merge

var ji1 = new JarInfo();
ji1.addFilename('a');
ji1.addURL('a');
ji1.addPOM(new POM('g', 'a', 'v'));

var ji2 = new JarInfo();
ji2.addFilename('b');
ji2.addURL('b');
ji2.addPOM(new POM('g2', 'a2', 'v2'));

ji1.merge(ji2);
assert(deepEqual(ji1.filenames, ['a', 'b']));
assert(deepEqual(ji1.urls, ['a', 'b']));
assert(deepEqual(ji1.poms, [new POM('g', 'a', 'v'), new POM('g2', 'a2', 'v2')]));

// test merge with repeated

var ji1 = new JarInfo();
ji1.addFilename('a');
ji1.addFilename('b');
ji1.addURL('a');
ji1.addURL('b');
ji1.addPOM(new POM('g', 'a', 'v'));
ji1.addPOM(new POM('g2', 'a2', 'v2'));

var ji2 = new JarInfo();
ji2.addFilename('b');
ji2.addURL('b');
ji2.addPOM(new POM('g2', 'a2', 'v2'));

ji1.merge(ji2);
assert(deepEqual(ji1.filenames, ['a', 'b']));
assert(deepEqual(ji1.urls, ['a', 'b']));
assert(deepEqual(ji1.poms, [new POM('g', 'a', 'v'), new POM('g2', 'a2', 'v2')]));


// test merge with repeated extending

var ji1 = new JarInfo();
ji1.addFilename('a');
ji1.addFilename('b');
ji1.addURL('a');
ji1.addURL('b');
ji1.addPOM(new POM('g', 'a', 'v'));
ji1.addPOM(new POM('g2', 'a2', 'v2'));

var ji2 = new JarInfo();
ji2.addFilename('b');
ji2.addFilename('c');
ji2.addURL('b');
ji2.addURL('c');
ji2.addPOM(new POM('g2', 'a2', 'v2'));
ji2.addPOM(new POM('g3', 'a3', 'v3'));

ji1.merge(ji2);
assert(deepEqual(ji1.filenames, ['a', 'b', 'c']));
assert(deepEqual(ji1.urls, ['a', 'b', 'c']));
assert(deepEqual(ji1.poms, [
    new POM('g', 'a', 'v'),
    new POM('g2', 'a2', 'v2'),
    new POM('g3', 'a3', 'v3')
]));

// test merge osgiready null

var ji1 = new JarInfo();

var ji2 = new JarInfo();
ji2.osgiready = true;

ji1.merge(ji2);
assert(ji1.osgiready);

// test equals

var ji1 = new JarInfo();
ji1.id = 'a'
ji1.addFilename('a');
ji1.addURL('a');
ji1.addPOM(new POM('g', 'a', 'v'));
ji1.osgiready = true;

var ji2 = new JarInfo();
ji2.id = 'a'
ji2.addFilename('a');
ji2.addURL('a');
ji2.addPOM(new POM('g', 'a', 'v'));
ji2.osgiready = true;

assert(ji1.equals(ji2));

var ji3 = new JarInfo();
ji3.id = 'b'
ji3.addFilename('a');
ji3.addURL('a');
ji3.addPOM(new POM('g', 'a', 'v'));
ji3.osgiready = true;

assert(!ji1.equals(ji3));

var ji4 = new JarInfo();
ji4.id = 'a'
ji4.addFilename('b');
ji4.addURL('a');
ji4.addPOM(new POM('g', 'a', 'v'));
ji4.osgiready = true;

assert(!ji1.equals(ji4));

var ji5 = new JarInfo();
ji5.id = 'a'
ji5.addFilename('a');
ji5.addURL('a');
ji5.addPOM(new POM('g1', 'a', 'v'));
ji5.osgiready = true;

assert(!ji1.equals(ji5));
