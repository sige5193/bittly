import ParameterBuilder from '../Builder.js'
export default class NoneBuilderHandler {
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
        return 'none';
    }

    /**
     * get preprocessed parameter data
     * @return {String}
     */
    getPreProcessedData() {
        return '';
    }

    /**
     * get request buffer data from content
     * @returns {Buffer}
     */
    buildBuffer() {
        return Buffer.from('');
    }
}