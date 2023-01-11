import Common from "../../../utils/Common.js";
export default class DataGeneratorScriptRuntime {
    /**
     * @constructor
     */
    constructor (options={}) {
        this.status = options.status;
        this.responses = [];
    }

    /**
     * @param {*} name 
     * @returns 
     */
    getStatusValue(name) {
        return this.status.getValueByName(name);
    }

    /**
     * @param {*} name 
     * @param {*} value 
     * @returns 
     */
    setStatusValue(name, value) {
        this.status.setValueByName(name, value);
    }

    /**
     * response as json
     * @param {Object} content 
     */
    writeJson(content) {
        this.responses.push({type : 'text', content : JSON.stringify(content)});
    }

    /**
     * response as hex
     * @param {String} content 
     */
    writeHex(content) {
        this.responses.push({type:'hex',content:content});
    }

    /**
     * response as text
     * @param {*} content 
     */
    writeText(content) {
        this.responses.push({type:'text',content:content});
    }
    
    /**
     * get response buffer
     * @returns 
     */
    getBuffer() {
        let buffers = [];
        for ( let i=0; i<this.responses.length; i++ ) {
            let item = this.responses[i];
            if ( 'hex' === item.type ) {
                buffers.push(Common.convertStringToHex(item.content));
            } else {
                buffers.push(Buffer.from(item.content));
            }
        }
        return Buffer.concat(buffers);
    }
}