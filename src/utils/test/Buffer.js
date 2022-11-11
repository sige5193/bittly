/**
 * mock buffer class for testing
 */
class Buffer extends Array {
    /**
     */
    static setup() {
        window.nodeBuffer = Buffer;
    }

    /**
     * constructor of buffer
     */
    constructor () {
        super();
        this.buffer = null;
    }

    static from( data ) {
        if ( Array.isArray(data) ) {
            return Buffer.fromArray(data);
        } else if ( 'string' === typeof(data) ) {
            return Buffer.fromString(data);
        }
    }

    /**
     * build buffer from string
     * @param {*} str 
     * @returns 
     */
    static fromString( str ) {
        let data = [];
        for ( let i=0; i<str.length; i++ ) {
            data[i] = str[i].charCodeAt();
        }
        return Buffer.fromArray(data);
    }

    /**
     * build buffer from array
     * @param {Array} data 
     * @returns {Buffer}
     */
    static fromArray( data ) {
        let buffer = new Buffer();
        buffer.buffer = new ArrayBuffer(data.length);
        let bufferView = new DataView(buffer.buffer);
        for ( let i=0; i<data.length; i++ ) {
            buffer.push(data[i]);
            bufferView.setUint8(i, data[i]);
        }
        return buffer;
    }

    /**
     * convert buffer to string
     * @returns {String}
     */
    toString() {
        return String.fromCharCode.apply(null, this);
    }

    /**
     * 
     */
    swap16() {

    }
}

window.Buffer = Buffer;
export default Buffer;