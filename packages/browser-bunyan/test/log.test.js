/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 *
 * Test the `log.trace(...)`, `log.debug(...)`, ..., `log.fatal(...)` API.
 */

import { createLogger } from '../src/index.js';
import { format } from '../src/util.js';
import { test, beforeEach as before, afterEach as after } from "tap";

const __dirname = new URL('.', import.meta.url).pathname;

// ---- test boolean `log.<level>()` calls

var log1 = createLogger({
    name: 'log1',
    streams: [
        {
            path: __dirname + '/log.test.log1.log',
            level: 'info'
        }
    ]
});

var log2 = createLogger({
    name: 'log2',
    streams: [
        {
            path: __dirname + '/log.test.log2a.log',
            level: 'error'
        },
        {
            path: __dirname + '/log.test.log2b.log',
            level: 'debug'
        }
    ]
})

test('log.LEVEL() -> boolean', function (t) {
    t.equal(log1.trace(), false, 'log1.trace() is false')
    t.equal(log1.debug(), false)
    t.equal(log1.info(), true)
    t.equal(log1.warn(), true)
    t.equal(log1.error(), true)
    t.equal(log1.fatal(), true)

    // Level is the *lowest* level of all streams.
    t.equal(log2.trace(), false)
    t.equal(log2.debug(), true)
    t.equal(log2.info(), true)
    t.equal(log2.warn(), true)
    t.equal(log2.error(), true)
    t.equal(log2.fatal(), true)
    t.end();
});


// ---- test `log.<level>(...)` calls which various input types

function Catcher() {
    this.records = [];
}
Catcher.prototype.write = function (record) {
    this.records.push(record);
}
var catcher = new Catcher();
var log3 = new createLogger({
    name: 'log3',
    streams: [
        {
            type: 'raw',
            stream: catcher,
            level: 'trace'
        }
    ]
});

var names = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
var fields = {one: 'un'};

test('log.info(undefined, <msg>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, undefined, 'some message');
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'undefined \'some message\'',
            format('log.%s msg is "some message"', lvl));
    });
    t.end();
});

test('log.info(<fields>, undefined)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, undefined);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'undefined',
            format('log.%s msg: expect "undefined", got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(null, <msg>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, null, 'some message');
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'some message',
            format('log.%s msg is "some message"', lvl));
    });
    t.end();
});

test('log.info(<fields>, null)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, null);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'null',
            format('log.%s msg: expect "null", got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<str>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, 'some message');
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'some message',
            format('log.%s msg is "some message"', lvl));
    });
    t.end();
});

test('log.info(<fields>, <str>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, 'some message');
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'some message',
            format('log.%s msg: got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<bool>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, true);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'true',
            format('log.%s msg is "true"', lvl));
    });
    t.end();
});

test('log.info(<fields>, <bool>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, true);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'true',
            format('log.%s msg: got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<num>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, 3.14);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '3.14',
            format('log.%s msg: got %j', lvl, rec.msg));
    });
    t.end();
});

test('log.info(<fields>, <num>)', function (t) {
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, 3.14);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '3.14',
            format('log.%s msg: got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<function>)', function (t) {
    var func = function func1() {};
    names.forEach(function (lvl) {
        log3[lvl].call(log3, func);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '[Function: func1]',
            format('log.%s msg: got %j', lvl, rec.msg));
    });
    t.end();
});

test('log.info(<fields>, <function>)', function (t) {
    var func = function func2() {};
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, func);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '[Function: func2]',
            format('log.%s msg: got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<array>)', function (t) {
    var arr = ['a', 1, {two: 'deux'}];
    names.forEach(function (lvl) {
        log3[lvl].call(log3, arr);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '[ \'a\', 1, {"two":"deux"} ]',
            format('log.%s msg: got %j', lvl, rec.msg));
    });
    t.end();
});

test('log.info(<fields>, <array>)', function (t) {
    var arr = ['a', 1, {two: 'deux'}];
    names.forEach(function (lvl) {
        log3[lvl].call(log3, fields, arr);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, '[ \'a\', 1, {"two":"deux"} ]',
            format('log.%s msg: got %j', lvl, rec.msg));
        t.equal(rec.one, 'un');
    });
    t.end();
});

test('log.info(<err>)', function (t) {
    var e = new Error('boom');
    names.forEach(function (lvl) {
        log3[lvl].call(log3, e);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.err.message, 'boom',
            format('log.%s err.message: got %j', lvl, rec.err.message));
    });
    t.end();
});

test('log.info(<str>, <obj>)', function (t) {
    var obj = { hello: 'world' };
    names.forEach(function (lvl) {
        log3[lvl].call(log3, 'some messsage', obj);
        var rec = catcher.records[catcher.records.length - 1];
        t.equal(rec.msg, 'some messsage {"hello":"world"}',
            format('log.%s msg: got %j', lvl, rec.msg));
    });
    t.end();
});
