import Common from '@/utils/Common.js';
import ParameterBuilder from '../Builder.js'
export default class BuildHandler {
    /**
     * construct of build handler
     * @param {ParameterBuilder} builder 
     */
    constructor( builder ) {
        this.builder = builder;
    }

    /**
     * get builder name
     * @returns {String}
     */
    getTypeName() {
        return 'hex';
    }

    /**
     * get preprocessed parameter data
     * @return {String}
     */
    getPreProcessedData() {
        let content = this.builder.paramContent;
        if ( Common.isEmpty(content) ) {
            return '';
        }

        content = this.builder.applyEnvVariablesToString(content);
        content = this.builder.applyVariableValueToString(content);
        
        this.builder.executeRequestScript();
        content = this.builder.applyStatusVariableToString(content);
        content = this.builder.applyScriptResultToString(content);
        content = this.builder.applyQuickCallToString(content, content);
        content = content.trim().replace(/\s*/g,'');
        content = content.toUpperCase();
        if ( !/^[ABCDEF0123456789]+$/.test(content) ) {
            throw Error(window.app.$t('directive.parameter.hex.illegalHexChar'));
        }
        return content;
    }

    /**
     * get request buffer data from content
     * @returns {Buffer}
     */
    buildBuffer() {
        let content = this.getPreProcessedData();
        if ( '' == content ) {
            return Buffer.from('');
        }
        let buffer = Common.convertStringToHex(content);
        return buffer;
    }
}