import Dictionary from '@/utils/Dictionary.js'
import Common from '@/utils/Common.js';
import ParameterBuilder from '../Builder.js'
import MyNumber from '@/utils/datatype/MyNumber.js'
export default class BuildHandler {
    /**
     * construct of build handler
     * @param {ParameterBuilder} builder 
     */
    constructor( builder ) {
        this.builder = builder;
        this.formRawData = null;
    }

    /**
     * get builder name
     * @returns {String}
     */
    getTypeName() {
        return 'form';
    }

    /**
     * get form raw data.
     * @returns {Object[]}
     */
    getFormRawData() {
        return this.formRawData;
    }

    /**
     * get preprocessed form fields
     * @return {Object[]}
     */
    getPreProcessedData() {
        let fields = [];
        if ( !Common.isEmpty(this.builder.paramContent) ) {
            fields = Common.objCopy(this.builder.paramContent);
        }
        
        // convert to real string and apply env and variable.
        for ( let i=0; i<fields.length; i++ ) {
            if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING','CHAR','UNSIGNED_CHAR'], fields[i].type) ) {
                fields[i].value = this.builder.convertStringToRealString(fields[i].value);
            }
            fields[i].value = this.builder.applyEnvVariablesToString(fields[i].value);
            fields[i].value = this.builder.applyVariableValueToString(fields[i].value);
        }

        // execute script and quick call
        this.builder.executeRequestScript();
        for ( let i=0; i<fields.length; i++ ) {
            fields[i].value = this.builder.applyStatusVariableToString(fields[i].value);
            fields[i].value = this.builder.applyScriptResultToString(fields[i].value);
            fields[i].value = this.builder.applyQuickCallToString(fields[i].value, fields);
        }
        
        this.formRawData = Common.objCopy(fields);
        for ( let i=0; i<fields.length; i++ ) {
            if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING'], fields[i].type) ) {
                fields[i].value = this.builder.convertStringCharset(fields[i].value, this.builder.directive.requestCharset);
            }
        }

        return fields;
    }

    /**
     * get request buffer data from content
     * @returns {Buffer}
     */
    buildBuffer() {
        let fields = this.getPreProcessedData();
        if ( 0 === fields.length ) {
            return Buffer.alloc(0);
        }
        return BuildHandler.packItemsToBuffer(this.builder.directive, fields);
    }

    /**
     * pack form items to buffer
     * @param {Array<Object>} items 
     * @returns {Buffer}
     */
    static packItemsToBuffer( directive, items ) {
        let bitsBufString = '';
        let buffers = [];
        for ( let i=0; i<items.length; i++ ) {
            let item = items[i];
            if ( 0 == item.value.length ) {
                continue;
            }

            // append basic data types
            if ( !Dictionary.match('DIRECTIVE_PARAM_DATATYPE', 'BITS', item.type) ) {
                buffers.push(BuildHandler.convertFormItemToBin(directive, item));
                continue;
            }
            
            // process bits
            bitsBufString += BuildHandler.convertBitsItemToBinString(item);
            if ( i == items.length-1 || 'bits' !== items[i+1].type ) {
                buffers.push(BuildHandler.convertBinStringToBuffer(bitsBufString));
                bitsBufString = '';
                continue;
            }
        }
        let data = Buffer.concat(buffers);
        return data;
    }

    /**
     * convert bin string to buffer
     * @param {*} bitsBufString 
     */
    static convertBinStringToBuffer(bitsBufString) {
        if ( 0 !== bitsBufString.length%8 ) {
            throw Error(window.app.$t('directive.parameter.form.dataTypeBitsNotMatchToByte'));
        }

        let length = bitsBufString.length/8;
        let bytes = [];
        for ( let i=0; i<length; i++ ) {
            let valstr = bitsBufString.substring(i*8, i*8+8);
            let valnum = MyNumber.parseNumberByRadixName(valstr, 'bin');
            bytes.push(valnum);
        }

        let buf = Buffer.from(bytes);
        return buf;
    }

    /**
     * convert form item to bin string
     * @param {Object} item 
     */
    static convertBitsItemToBinString( item ) {
        let num = MyNumber.parseNumberByRadixName(item.value,item.format,true);
        let str = num.toString(2);
        str = str.padStart(item.length, '0');
        if ( str.length > item.length ) {
            throw Error(window.app.$t('directive.parameter.form.dataTypeBitsOverLenght',[`(${item.format})${item.value}`,item.length]));
        }
        return str;
    }

    /**
     * convert form item to buffer data
     * @param {Object} item
     * @returns {Buffer}
     */
    static convertFormItemToBin( directive, item ) {
        if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE', 'BITS', item.type) ) {
            throw Error('unable convert data type "bits" to bin');
        }
        
        let itemValue = item.value;
        if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE','FILE', item.type) ) {
            let itemData = Common.fileGetContent(itemValue);
            return Buffer.from(itemData);
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE','BYTES', item.type) ) {
            let itemData = Common.convertStringToHex(itemValue);
            return Buffer.from(itemData.buffer);
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING','CHAR'], item.type) ) {
            return Buffer.from(itemValue);
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['FLOAT','DOUBLE'], item.type) ) {
            let itemDataFloat = MyNumber.fromString(itemValue);
            itemDataFloat.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
            itemDataFloat.setIsBigEndian('big-endian' == directive.endianness);
            itemDataFloat.setIsInteger(false);
            return itemDataFloat.toBuffer();
        } else if ( Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'unsigned', false) ) {
            let itemDataUnsigned = MyNumber.fromString(itemValue);
            itemDataUnsigned.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
            itemDataUnsigned.setRadix(item.format);
            itemDataUnsigned.setIsBigEndian('big-endian' == directive.endianness);
            itemDataUnsigned.setIsUnsigned(true);
            itemDataUnsigned.setIsInteger(true);
            return itemDataUnsigned.toBuffer();
        } else if ( !Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'unsigned', true) ) {
            let itemDataSigned = MyNumber.fromString(itemValue);
            itemDataSigned.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
            itemDataSigned.setRadix('dec');
            itemDataSigned.setIsBigEndian('big-endian' == directive.endianness);
            itemDataSigned.setIsUnsigned(false);
            itemDataSigned.setIsInteger(true);
            return itemDataSigned.toBuffer();
        } else {
            throw Error("unable to handle item");
        }
    }
}