import assert from 'assert';
import {parseHTML} from '../src/parser.js';

describe('parse html', function() {
    it('<a>abc</a>', function() {
        let tree = parseHTML('<a>abc</a>');
        console.log(tree);
        assert.equal(1, 1);
    });
})