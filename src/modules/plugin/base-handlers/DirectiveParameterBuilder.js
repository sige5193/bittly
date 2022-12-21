export default class DirectiveParameterBuilder {
    /**
     * construct of build handler
     * @param {ParameterBuilder} builder 
     */
    constructor( builder ) {
        this.builder = builder;
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