import crc from 'crc';
import FormBuildHandler from '../parameters/form/BuildHandler.js';
import { Buffer } from 'buffer';
import MdbDirective from '../../../models/MdbDirective.js';
import BuildHandler from '../parameters/form/BuildHandler.js';
import MyObject from '../../../utils/datatype/MyObject.js';
import MyDate from '../../../utils/datatype/MyDate.js';
export default class ScriptLib {
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
    createUint8(value, format='hex') {
        return {type:'byte',value,format};
    }

    /**
     * create new value as int8
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    createInt8(value) {
        return {type:'char_int',value};
    }

    /**
     * create new value as char
     * @param {String} value 
     * @returns {Object}
     */
    createChar(value) {
        return {type:'char',value};
    }

    /**
     * create new value as short
     * @param {String} value 
     * @returns {Object}
     */
    createUchar(value) {
        return {type:'unsigned_char',value};
    }

    /**
     * create new value as uint16
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    createUint16(value, format='hex') {
        return {type:'unsigned_short',value,format};
    }

    /**
     * create new value as int16
     * @param {String} value 
     * @returns {Object}
     */
    createInt16(value) {
        return {type:'short',value};
    }

    /**
     * create new value as uint32
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    createUint32(value, format='hex') {
        return {type:'unsigned_int',value,format};
    }

    /**
     * create new value as int32
     * @param {String} value 
     * @returns {Object}
     */
    createInt32(value) {
        return {type:'int',value};
    }

    /**
     * create new value as uint64
     * @param {String} value 
     * @param {String} format 
     * @returns {Object}
     */
    createUint64(value, format='hex') {
        return {type:'unsigned_long_long',value,format};
    }

    /**
     * create new value as int64
     * @param {String} value 
     * @returns {Object}
     */
    createInt64(value) {
        return {type:'long_long',value};
    }

    /**
     * create new value as float
     * @param {String} value 
     * @returns {Object}
     */
    createFloat(value) {
        return {type:'float',value};
    }

    /**
     * create new value as double
     * @param {String} value 
     * @returns {Object}
     */
    createDouble(value) {
        return {type:'double',value};
    }

    /**
     * create new value as string
     * @param {String} value 
     * @returns {Object}
     */
    createString(value,length) {
        return {type:'string',value,length};
    }

    /**
     * create new value as bytes
     * @param {String} value 
     * @returns {Object}
     */
    createBytes(value,length) {
        return {type:'bytes',value,length};
    }

    /**
     * create new value as bits
     * @param {String} value 
     * @returns {Object}
     */
    createBits(value,length) {
        return {type:'bits',value,length};
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
        let buffer = this.buildBufferFromValueItems(values);
        let sum = 0;
        for ( let i=0; i<buffer.length; i++ ) {
            sum += buffer[i];
        }
        return sum;
    }

    /**
     * Build buffer from value items.
     * @param {Array<Object>} values 
     * @returns {Buffer}
     */
    buildBufferFromValueItems( values ) {
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

        let items = MyObject.copy(values);
        for ( let i=0; i<items.length; i++ ) {
            if ( undefined != typemap[items[i].type] ) {
                items[i].type = typemap[items[i].type];
            }
            if ( 'number' == typeof(items[i].value) ) {
                items[i].value = `${items[i].value}`;
                items[i].format = 'dec';
            }
        }

        let buffer = BuildHandler.packItemsToBuffer(this.directive, items);
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
}