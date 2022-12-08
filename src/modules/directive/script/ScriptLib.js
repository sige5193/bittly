import crc from 'crc';
import FormBuildHandler from '../parameters/form/BuildHandler.js';
import { Buffer } from 'buffer';
import MdbDirective from '../../../models/MdbDirective.js';
export default class ScriptLib {
    /**
     * constructor of lib
     * @param {MdbDirective} directive 
     */
    constructor(directive) {
        this.directive = directive;
    }

    /**
     * returns the content that been given.
     * @param {string} content 
     * @returns {string}
     */
    echo ( content ) {
        return content;
    }

    /**
     * get current timestamp
     * @returns {Number}
     */
    timestamp() {
        return parseInt((new Date()).getTime() / 1000);
    }

    /**
     * get a random number between `min` and `max`.
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    random( min, max ) {
        let range = max - min;
        let rand = Math.random();
        return min * 1 + Math.round(rand * range);
    }
    
    /**
     * get sum value of bytes by given values.
     * @param {Array} values 
     * @return {Number}
     */
    bytesSum( ... values ) {
        let sum = 0;
        for ( let i=0; i<values.length; i++ ) {
            let bytes = this.valueToBytes(values[i]);
            for ( let bi=0; bi<bytes.length; bi++ ) {
                sum += bytes[bi];
            }
        }
        return sum;
    }

    /**
     * convert value to bytes
     * @param {Object} value 
     * @returns {Buffer}
     */
    valueToBytes( value ) {
        let typemap = {
            int8 : 'char_int',
            uint8 : 'byte',
            int16 : 'short',
            uint16 : 'unsigned_short',
            int32 : 'int',
            uint32 : 'unsigned_int',
            int64 : 'long_long',
            uint64 : 'unsigned_long_long',
        };
        if ( undefined != typemap[value.type] ) {
            value.type = typemap[value.type];
        }
        if ( 'number' == typeof(value.value) ) {
            value.value = `${value.value}`;
            value.format = 'dec';
        }

        let buffer = FormBuildHandler.convertFormItemToBin(this.directive, value);
        return buffer;
    }

    /**
     * Generate data for CRC
     * @param {Array|Object|String} data 
     * @returns {Buffer}
     */
    generateCRCData( data ) {
        let items = [];
        for ( let i=0; i<data.length; i++ ) {
            let item = data[i];
            if ( 'string' == typeof(item) ) {
                item = {type : 'string', value : item};
            }
            items.push(item);
        }
        return FormBuildHandler.packItemsToBuffer(this.directive, items);
    }

    /**
     * crc
     * @param {*} mode 
     * @param  {...any} values 
     * @returns 
     */
    crc(mode, ... values) {
        let crcData = this.generateCRCData(values);
        let result = crc[mode](crcData);
        return result;
    }
}