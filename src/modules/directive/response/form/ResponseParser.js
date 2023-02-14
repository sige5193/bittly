import { Buffer } from "buffer";
import Dictionary from "@/utils/Dictionary";
import Common from "../../../../utils/Common.js";
import Formatter from '@/utils/Formatter.js'
import MyNumber from "../../../../utils/datatype/MyNumber.js";
export default class ResponseParser {
    /**
     * constructor of response parser
     * @param {MdbDirective} directive 
     * @param {Buffer} responseBuffer 
     * @param {Boolean} autoStart
     */
    constructor( directive, responseBuffer, autoStart ) {
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        this.directive = directive;
        /**
         * byte index where to start parse
         * @property {Number}
         */
        this.cursor = 0;
        /**
         * buffer of response data
         * @property {Buffer}
         */
        this.responseBuffer = responseBuffer;

        this.values = [];
        this.isComplete = true;
        if ( undefined === autoStart || true === autoStart ) {
            this.parse();
        }
    }
    
    /**
     * set response buffer to parser.
     * @param {*} buffer 
     */
    setResponseBuffer( buffer ) {
        this.responseBuffer = buffer;
    }

    /**
     * set cursor to parser
     * @param {Number} cursor 
     */
    setCursor( cursor ) {
        this.cursor = cursor;
    }

    /**
     * parse to last complete match
     * @returns {Object}
     */
    parseToLastCompleteMatch() {
        let valuesList = [];
        let endpos = 0;
        while ( false !== endpos && endpos < this.responseBuffer.length ) {
            let cursor = this.parse();
            if ( !this.isComplete ) {
                break;
            }

            endpos = cursor;
            valuesList.push(Array.from(this.values));
        }
        return {valuesList,endpos};
    }

    /**
     * parse response buffer to last matched structure. and returns all
     * parsed values.
     */
    parseToLast() {
        let valuesList = [];
        let hasMore = true;
        do {
            let endpos = this.parse();
            valuesList.push(Array.from(this.values));
            if ( false === endpos ) {
                hasMore = false;
                break;
            }
            if ( endpos >= this.responseBuffer.length ) {
                hasMore = false;
                break;
            }
        } while ( hasMore );
        return valuesList;
    }

    /**
     * parse response content.
     * @returns {Number} parse end position
     */
    parse() {
        this.values = [];
        if ( null == this.responseBuffer || undefined == this.directive.responseFormatter.fields ) {
            this.isComplete = false;
            return false;
        }
        
        let bitOffset = 0;
        let byteIndex = this.cursor;
        this.isComplete = true;
        for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
            let field = this.directive.responseFormatter.fields[i];
            let dataTypeLength = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', field.type, 'length', 0);
            if ( 0 == dataTypeLength ) {
                dataTypeLength = field.length;
            }
            if ( 'bits' === field.type )  {
                dataTypeLength = Math.ceil(dataTypeLength/8);
            }

            if ( byteIndex + dataTypeLength > this.responseBuffer.length 
            || ('bits' !== field.type && 0 !== bitOffset) ) {
                this.values.push('');
                this.isComplete = false;
                byteIndex = this.responseBuffer.length;
                continue;
            }

            if ( -1 !== ['char'].indexOf(field.type) ) {
                byteIndex = this.parseAsChar(field, byteIndex);
            } else if ( -1 !== ['short','char_int','int','long','long_long'].indexOf(field.type) ) {
                byteIndex = this.parseAsSignedNumber(field, byteIndex);
            } else if ( -1 !== ['byte','unsigned_char', 'unsigned_short','unsigned_int','unsigned_long','unsigned_long_long'].indexOf(field.type) ) {
                byteIndex = this.parseAsUnsignedNumber(field, byteIndex);
            } else if ( -1 !== ['float','double'].indexOf(field.type) ) {
                byteIndex = this.parseAsFloat(field, byteIndex);
            } else if ( 'string' == field.type ) {
                byteIndex = this.parseAsString(field, byteIndex);
            } else if ( 'bytes' == field.type ) {
                byteIndex = this.parseAsBytes(field, byteIndex);
            } else if ( 'bits' === field.type ) {
                byteIndex = this.parseAsBits(field, byteIndex, bitOffset);
                bitOffset += field.length;
                bitOffset %= 8;
            }
        }
        
        if ( this.isComplete ) {
            this.cursor = byteIndex;
        }

        return byteIndex;
    }

    /**
     * execute field expression
     * @param {*} field 
     * @param {*} value 
     */
    executeExpression(field, value) {
        if ( !field.expression ) {
            return value;
        }
        try {
            let expression = field.expression.replaceAll('{{value}}', 'value');
            expression = `return ${expression};`;
            let func = new Function('value', expression);
            return func(value);
        } catch ( e ) {
            return 'Expression Error';
        }
    }

    /**
     * parser as bits
     * @param {*} field 
     * @param {*} index 
     * @param {*} bitOffset 
     */
    parseAsBits(field, index, bitOffset ) {
        let byteCount = Math.ceil((field.length * 1 + bitOffset) / 8);
        if ( 0 === byteCount ) {
            throw Error('the length of response data type "bits" can not be 0');
        }

        let offset = bitOffset;
        let length = field.length * 1;
        let bits = [];
        let bytes = this.responseBuffer.slice(index, index + byteCount);
        for ( let i=0; i<bytes.length; i++ ) {
            while ( offset < 8 && 0 < length) {
                let bit = bytes[i] >> (7 - offset) & 0x01;
                bits.push(bit);
                length --;
                offset ++;
            }
            offset = 0;
        }

        bits = '0b' + bits.join('');
        let value = BigInt(bits);
        value = this.executeExpression(field, value);
        
        let radixMap = {bin:2,oct:8,dec:10,hex:16};
        value = value.toString(radixMap[field.format]).toUpperCase();
        if ( 'bin' === field.format ) {
            value = value.padStart(field.length * 1,'0');
            value = value.replaceAll(/(....)/g,'$1 ').trim();
        }
        this.values.push(value);
        index += Math.floor((field.length * 1 + bitOffset) / 8);
        return index;
    }

    /**
     * parse as char
     * @return {Number} 
     */
    parseAsChar(field, index) {
        let byte = this.responseBuffer[index];
        let char = String.fromCharCode(byte);
        char = this.executeExpression(field, char);
        this.values.push(char);
        return index + 1;
    }

    /**
     * parse signed number, and returns the pased number.
     * @param {Object} field
     * @param {Number} index
     * @return {Number} 
     */
    parseAsSignedNumber(field, index) {
        let dataTypeLength = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', field.type, 'length');
        let getter = `getInt${8*dataTypeLength}`;
        if ( 8 == dataTypeLength ) {
            getter = 'getBigInt64';
        }

        let isLittleEndian = false;
        if ( !field.endianness || 'default' === field.endianness ) {
            isLittleEndian = 'little-endian' == this.directive.endianness;
        } else {
            isLittleEndian = 'little-endian' == field.endianness;
        }

        let buffer = this.responseBuffer.slice(index, index + dataTypeLength);
        let dataView = Common.convertBufferToDataView(buffer);
        let value = dataView[getter](0, isLittleEndian);
        value = this.executeExpression(field, value);
        this.values.push(value.toString());
        return index + dataTypeLength;
    }

    /**
     * parse unsigned number, and returns the pased number.
     * @param {Object} field
     * @param {Number} index
     * @return {Number} 
     */
    parseAsUnsignedNumber(field, index) {
        let dataTypeLength = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', field.type, 'length');
        let getter = `getUint${8*dataTypeLength}`;
        if ( 8 == dataTypeLength ) {
            getter = 'getBigUint64';
        }
        
        let isLittleEndian = false;
        if ( !field.endianness || 'default' === field.endianness ) {
            isLittleEndian = 'little-endian' == this.directive.endianness;
        } else {
            isLittleEndian = 'little-endian' == field.endianness;
        }
        
        let buffer = this.responseBuffer.slice(index, index + dataTypeLength);
        let dataView = Common.convertBufferToDataView(buffer);
        let value = dataView[getter](0,isLittleEndian);
        
        if ( field.expression ) {
            value = this.executeExpression(field, value);
            this.values.push(value);
            return index + dataTypeLength;
        }

        let radixMap = {bin:2,oct:8,dec:10,hex:16};
        value = value.toString(radixMap[field.format]).toUpperCase();
        
        if ( 'hex' == field.format ) {
            if ( 0 != value.length%2 ) {
                value = `0${value}`;
            }
            value = value.padStart(field.length * 2,'0');
            value = value.replace(/../g, function(item){ return `${item} ` });
            value = value.trim();
        }
        this.values.push(value);
        return index + dataTypeLength;
    }

    /**
     * parse data to float or double
     * @param {*} index 
     * @param {*} field 
     * @returns 
     */
    parseAsFloat(field, index) {
        let length = 4;
        let getter = 'getFloat32';
        if ( 'double' === field.type ) {
            length = 8;
            getter = 'getFloat64';
        }
        
        let isLittleEndian = false;
        if ( !field.endianness || 'default' === field.endianness ) {
            isLittleEndian = 'little-endian' == this.directive.endianness;
        } else {
            isLittleEndian = 'little-endian' == field.endianness;
        }
        
        let buffer = this.responseBuffer.slice(index, index + length);
        let dataView = Common.convertBufferToDataView(buffer);
        let value = dataView[getter](0, isLittleEndian);
        value = this.executeExpression(field, value);
        this.values.push(value.toString());
        return index + length;
    }

    /**
     * parse data as byte array from given start index
     * @param {Object} field data field defination
     * @param {Number} index position to start processing
     * @returns {Number} new position to process for the next step.
     */
    parseAsBytes( field, index ) {
        let length = field.length * 1;
        if ( 0 === length ) {
            throw Error('the length of response data type "bytes" can not be 0');
        }

        let buf = this.responseBuffer.slice(index, index+length);
        let value = Formatter.asHexString(buf);
        value = this.executeExpression(field, value);
        this.values.push(value);
        index += buf.length;
        return index;
    }

    /**
     * parse as string, and returns the new index of processed position.
     * @link https://git.sigechen.com/sige/bittly/issues/43
     * @param {Object} field data field defination
     * @param {Number} index position to start processing
     * @returns {Number} new position to process for the next step.
     */
    parseAsString(field, index) {
        let length = field.length * 1;
        if ( 0 === length ) {
            throw Error('the length of response data type "string" can not be 0');
        }
        
        let strbuf = this.responseBuffer.slice(index, index+length);
        index += strbuf.length;
        
        // truncate string by NULL value or '\0' for c style string
        let strlen = strbuf.indexOf(0x0);
        if ( -1 == strlen ) {
            strlen = strbuf.length;
        }

        let value = '';
        if ( 0 < strlen ) {
            value = strbuf.slice(0, strlen);
            value = Common.charsetConvert(value, 'utf-8', this.directive.responseCharset);
            value = value.toString();
        }

        value = this.executeExpression(field, value);
        this.values.push(value);
        return index;
    }

    /**
     * get if form fully parsed.
     * @returns {Boolean}
     */
    getIsComplete() {
        return this.isComplete;
    }

    /**
     * get value array
     * @returns {Arraby}
     */
    getValues() {
        return this.values;
    }

    /**
     * get value by given index.
     * @param {Number} index 
     */
    getValueByIndex( index ) {
        return this.values[index];
    }
    
    /**
     * convert field value to number
     * @returns {Number}
     */
    getReadableValueByIndex( index ) {
        let field = this.directive.responseFormatter.fields[index];
        if ( undefined === field ) {
            return '';
        }
        
        let value = this.getValueByIndex(index);
        let rawTypes = ['short','int','long','long_long', 'float', 'double','string', 'bytes','char'];
        if ( -1 !== rawTypes.indexOf(field.type) ) {
            return value;
        }
        if ( field.expression ) {
            return value;
        }
        
        let number = MyNumber.parseNumberByRadixName(value, field.format);
        return number.toString();
    }

    /**
     * @param {*} name 
     * @returns 
     */
    getReadableValueByName( name ) {
        let index = -1;
        for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
            let field = this.directive.responseFormatter.fields[i];
            if ( field.name.trim() === name ) {
                index = i;
                break;
            }
        }

        if ( -1 === index && '$' === name[0] ) {
            index = parseInt(name.substr(1)) - 1;
            if ( undefined === this.directive.responseFormatter.fields[index] ) {
                index = -1;
            }
        }
        
        return this.getReadableValueByIndex(index);
    }

    /**
     * get value by given name
     * @param {String} name Form field name
     */
    getValueByName( name ) {
        if ( null == this.responseBuffer || undefined == this.directive.responseFormatter.fields ) {
            return '';
        }

        let fields = this.directive.responseFormatter.fields;
        for ( let i=0; i<fields.length; i++ ) {
            if ( fields[i].name == name ) {
                return this.values[i];
            }
        }
        return '';
    }
}