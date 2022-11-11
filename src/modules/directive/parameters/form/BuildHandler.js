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
        
        for ( let i=0; i<fields.length; i++ ) {
            if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING','CHAR','UNSIGNED_CHAR'], fields[i].type) ) {
                fields[i].value = this.builder.convertStringToRealString(fields[i].value);
            }
            fields[i].value = this.builder.applyEnvVariablesToString(fields[i].value);
            fields[i].value = this.builder.applyVariableValueToString(fields[i].value);
        }

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

        let buffers = [];
        for ( let i=0; i<fields.length; i++ ) {
            let item = fields[i];
            if ( 0 == item.value.length ) {
                continue;
            }
            buffers.push(BuildHandler.convertFormItemToBin(this.builder.directive, item));
        }
        let data = Buffer.concat(buffers);
        return data;
    }

    /**
     * convert form item to buffer data
     * @param {Object} item
     * @returns {Buffer}
     */
    static convertFormItemToBin( directive, item ) {
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