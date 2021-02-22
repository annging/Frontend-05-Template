// var assert = require('assert');
// var add = require('../add.js').add;
// var mul = require('../add.js').mul;
import assert from 'assert';
import {add, mul} from '../add.js';

describe('add function test', function() {
    it('1+2 = 3', function() {
        assert.equal(add(1, 2), 3);
    });
    it('1+5 = 6', function() {
        assert.equal(add(1, 5), 6);
    });
})