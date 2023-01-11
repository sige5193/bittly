import Common from '../../../utils/Common.js'
import MyNumber from '../../../utils/datatype/MyNumber.js'
import Dictionary from '../../../utils/Dictionary.js'
import DataGeneratorScriptRuntime from './DataGeneratorScriptRuntime.js'
import { faker } from '@faker-js/faker';
export default class DataGenerator {
    /**
     * @param {Object} options 
     */
    constructor( options ) {
        this.status = options.status;
        this.requestData = options.requestData || null;
    }
    /**
     * generate buffer by given entry options
     * @param {*} entry 
     * @returns {Buffer}
     */
    generate(entry) {
        let handler = `handle${entry.handler}`;
        let data = this[handler](entry);
        if ( 0 === data.length ) {
            throw Error(window.app.$t('mock.responseContentCanNotBeEmpty'));
        }
        return data;
    }

    /**
     * generate buffer by text handler
     * @param {*} entry 
     * @returns {Buffer}
     */
    handleText( entry ) {
        let content = entry.content;
        content = content.replaceAll('\r\n', '\n');
        content = content.replaceAll('\r', '\n');
        if ( 'CRLF' == entry.nlstyle ) {
            content = content.replaceAll('\n', '\r\n');
        } else if ( 'CR' == entry.nlstyle ) {
            content = content.replaceAll('\n', '\r');
        }
        content = this.applyStatusValueToContent(content);
        return Buffer.from(content);
    }

    /**
     * generate buffer by hex handler
     * @param {*} entry 
     * @returns {Buffer}
     */
    handleHex( entry ) {
        let content = Common.convertStringToHex(entry.content);
        return content;
    }

    /**
     * generate buffer by form handler
     * @param {*} entry 
     * @returns 
     */
    handleForm( entry ) {
        let buffers = [];
        for ( let i=0; i<entry.content.length; i++ ) {
            let item = entry.content[i];
            if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE','BYTES', item.type) ) {
                let itemData = Common.convertStringToHex(item.value);
                let tmpBuf = Buffer.from(itemData.buffer);
                buffers.push(tmpBuf);
            } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING','CHAR'], item.type) ) {
                buffers.push(Buffer.from(itemValue));
            } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['FLOAT','DOUBLE'], item.type) ) {
                let itemDataFloat = MyNumber.fromString(itemValue);
                itemDataFloat.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
                itemDataFloat.setIsBigEndian('big-endian' == directive.endianness);
                itemDataFloat.setIsInteger(false);
                let tmpBuf = itemDataFloat.toBuffer();
                buffers.push(tmpBuf);
            } else if ( Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'unsigned', false) ) {
                let itemDataUnsigned = MyNumber.fromString(item.value);
                itemDataUnsigned.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
                itemDataUnsigned.setRadix(item.format);
                itemDataUnsigned.setIsBigEndian(item.isBigEndian);
                itemDataUnsigned.setIsUnsigned(true);
                itemDataUnsigned.setIsInteger(true);
                let tmpBuf = itemDataUnsigned.toBuffer();
                buffers.push(tmpBuf);
            } else if ( !Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', item.type, 'unsigned', true) ) {
                let itemDataSigned = MyNumber.fromString(itemValue);
                itemDataSigned.setByteLength(Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length'));
                itemDataSigned.setRadix('dec');
                itemDataSigned.setIsBigEndian(item.isBigEndian);
                itemDataSigned.setIsUnsigned(false);
                itemDataSigned.setIsInteger(true);
                let tmpBuf =  itemDataSigned.toBuffer();
                buffers.push(tmpBuf);
            } else {
                throw Error("unable to handle item");
            }
        }
        return Buffer.concat(buffers);
    }

    /**
     * generate buffer by script handler
     * @param {*} entry 
     * @returns {Buffer}
     */
    handleScript( entry ) {
        try {
            let runtime = new DataGeneratorScriptRuntime({
                status : this.status
            });
            (new Function('$this' , entry.content))(runtime);
            return runtime.getBuffer();
        } catch ( e ) {
            throw Error(e);
        }
    }

    /**
     * generate buffer by random handler
     * @param {*} entry 
     * @returns {Buffer}
     */
    handleRandom( entry ) {
        let template = entry.content;
        if ( 0 == template.trim().length ) {
            template = '{{random.alphaNumeric}}';
        }
        
        // replace holders
        while ( -1 != template.indexOf('{{hex}}') ) {
            template = template.replace('{{hex}}', faker.datatype.hexadecimal().toUpperCase().replace('0X',''));
        }
        while ( -1 != template.indexOf('{{byte}}') ) {
            template = template.replace('{{byte}}', faker.datatype.hexadecimal(2).toUpperCase().replace('0X',''));
        }
        let alias = {
            n : 'random.numeric',
            a : 'random.alpha',
            A : 'random.alpha({"casing":"upper"})',
        };
        for ( let akey in alias ) {
            template = template.replaceAll(`{{${akey}}}`, `{{${alias[akey]}}}`);
        }
        let content = faker.fake(template);

        if ( 'text' === entry.mode ) {
            return Buffer.from(content);
        } else {
            return Common.convertStringToHex(content);
        }
    }

    /**
     * apply status value to content
     * @param {*} content 
     * @returns 
     */
    applyStatusValueToContent( content ) {
        let newContent = content;
        let regex = /\{\{status\.(?<status>.*?)\}\}/gm;
        let match = null;
        
        while ((match = regex.exec(content)) !== null) {
            let varName = match.groups.status;
            let varValue = this.status.getValueByName(varName);
            newContent = newContent.replaceAll(match[0], varValue);
        }

        return newContent;
    }
}