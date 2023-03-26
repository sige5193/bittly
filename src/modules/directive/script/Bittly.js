import crc from 'crc';
import FormBuildHandler from '../parameters/form/BuildHandler.js';
import { Buffer } from 'buffer';
import MdbDirective from '../../../models/MdbDirective.js';
import BuildHandler from '../parameters/form/BuildHandler.js';
import MyDate from '../../../utils/datatype/MyDate.js';
import Dictionary from '../../../utils/Dictionary.js'
export default class Bittly {
    /**
     * constructor of lib
     * @param {MdbDirective} directive 
     */
    constructor(directive) {
        this.directive = directive;

        // data format
        this.BIN = 'bin';
        this.OCT = 'oct';
        this.DEC = 'dec';
        this.HEX = 'hex';
    }

    /**
     * create new value as uint8
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    uint8(value, format='hex') {
        if ( 'number' === typeof(value) ) {
            value = value.toString();
            format = 'dec';
        }
        return {type:'byte',value,format};
    }

    /**
     * create new value as int8
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    int8(value) {
        value = value.toString();
        return {type:'char_int',value};
    }

    /**
     * create new value as char
     * @param {String} value 
     * @returns {Object}
     */
    char(value) {
        value = value.toString();
        return {type:'char',value};
    }

    /**
     * create new value as short
     * @param {String} value 
     * @returns {Object}
     */
    uchar(value) {
        value = value.toString();
        return {type:'unsigned_char',value};
    }

    /**
     * create new value as uint16
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    uint16(value, format='hex') {
        if ( 'number' === typeof(value) ) {
            value = value.toString();
            format = 'dec';
        }
        return {type:'unsigned_short',value,format};
    }

    /**
     * create new value as int16
     * @param {String} value 
     * @returns {Object}
     */
    int16(value) {
        value = value.toString();
        return {type:'short',value};
    }

    /**
     * create new value as uint32
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    uint32(value, format='hex') {
        if ( 'number' === typeof(value) ) {
            value = value.toString();
            format = 'dec';
        }
        return {type:'unsigned_int',value,format};
    }

    /**
     * create new value as int32
     * @param {String} value 
     * @returns {Object}
     */
    int32(value) {
        value = value.toString();
        return {type:'int',value};
    }

    /**
     * create new value as uint64
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    uint64(value, format='hex') {
        if ( 'number' === typeof(value) ) {
            value = value.toString();
            format = 'dec';
        }
        return {type:'unsigned_long_long',value,format};
    }

    /**
     * create new value as int64
     * @param {String} value 
     * @returns {Object}
     */
    int64(value) {
        value = value.toString();
        return {type:'long_long',value};
    }

    /**
     * create new value as float
     * @param {String} value 
     * @returns {Object}
     */
    float(value) {
        value = value.toString();
        return {type:'float',value};
    }

    /**
     * create new value as double
     * @param {String} value 
     * @returns {Object}
     */
    double(value) {
        value = value.toString();
        return {type:'double',value};
    }

    /**
     * create new value as string
     * @param {String} value 
     * @returns {Object}
     */
    string(value, length=null) {
        length = length || value.length;
        return {type:'string',value,length};
    }

    /**
     * create new value as bytes
     * @param {String} value 
     * @returns {Object}
     */
    bytes(value,length=null) {
        if ( 'string' !== typeof(value) ) {
            throw Error('value for bittly.bytes() must be a string of hex');
        }
        length = length || Math.ceil(value.replaceAll(/\s/g,'').length / 2);
        return {type:'bytes',value,length};
    }

    /**
     * create new value as bits
     * @param {String} value 
     * @returns {Object}
     */
    bits(value,length=null) {
        if ( 'string' !== typeof(value) ) {
            throw Error('value for bittly.bits() must be a string of hex');
        }
        length = length || value.replaceAll(/\s/g,'').length;
        return {type:'bits', value, length, format:'bin'};
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
        let buffer = BuildHandler.packItemsToBuffer(this.directive, values);
        let sum = 0;
        for ( let i=0; i<buffer.length; i++ ) {
            sum += buffer[i];
        }
        return sum;
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

    /**
     * @param {*} format 
     * @param {*} date 
     * @returns 
     */
    date(format, date=null) {
        if ( null === date ) {
            date = new Date();
        }
        return MyDate.format(date, format);
    }

    /**
     * @param  {... Object|Integer} values 
     * @returns {Integer}
     */
    lengthSum( ... values ) {
        let len = 0;
        let bitLen = 0;
        for ( let i=0; i<values.length; i++ ) {
            let item = values[i];
            if ( 'number' === typeof(item) ) {
                len += item;
            } else if ( 'bits' === item.type ) {
                bitLen += item.length;
            } else {
                let dataTypeLength = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'length', 0) * 1;
                if ( 0 === dataTypeLength ) {
                    throw Error(`unable to calculate the length of data type "${item.type}"`);
                }
                len += dataTypeLength;
            }
        }
        if ( 0 !== bitLen%8 ) {
            throw Error(`unable to convert bits length "${bitLen}" to byte length`);
        }
        return len + bitLen/8;
    }

    /**
     * @param  {...any} values 
     * @returns 
     */
    bcc( ... values ) {
        let buffer = FormBuildHandler.packItemsToBuffer(this.directive, values);
        let result = null;
        for ( let bi=0; bi<buffer.length; bi++ ) {
            let byte = buffer[bi];
            if ( null === result ) {
                result = byte;
            } else {
                result ^= byte;
            }
        }
        return result;
    }
}