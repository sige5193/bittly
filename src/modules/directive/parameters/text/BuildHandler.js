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
        return 'text';
    }

    /**
     * get preprocessed parameter data
     * @return {String}
     */
    getPreProcessedData() {
        let content = this.builder.paramContent;
        if ( Common.isEmpty(content) ) {
            content = '';
        }
        
        content = this.builder.convertStringToRealString(content);
        content = this.builder.applyEnvVariablesToString(content);
        content = this.builder.applyVariableValueToString(content);
        
        this.builder.executeRequestScript();
        content = this.builder.applyStatusVariableToString(content);
        content = this.builder.applyScriptResultToString(content);
        content = this.builder.applyQuickCallToString(content, content);
        content = this.builder.convertStringCharset(content, this.builder.directive.requestCharset);
        return content;
    }

    /**
     * get request buffer data from content
     * @returns {Buffer}
     */
    buildBuffer() {
        let content = this.getPreProcessedData();
        let buffer = Buffer.from(content);
        return buffer;
    }
}