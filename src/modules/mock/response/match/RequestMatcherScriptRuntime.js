import Common from "../../../../utils/Common.js";
export default class RequestMatcherScriptRuntime {
    /**
     * @constructor
     * @param {*} options 
     */
    constructor( options = {} ) {
        this.data = options.data || Buffer.alloc(0);
        this.dataview = Common.convertBufferToDataView(this.data);
        this.isMatched = false;
    }

    /**
     * read number from given data buffer.
     * @param {*} handler 
     * @param {*} data 
     * @param {*} index 
     * @param {*} isLittleEndian 
     * @returns {Number}
     */
    readNumber(cursor, handler, isLittleEndian) {
        return this.dataview[handler](cursor,isLittleEndian);
    }

    /**
     * @returns 
     */
    readInt8(pos) {
        return this.readNumber(pos, 'getInt8', false);
    }

    /**
     * @returns 
     */
    readUint8(pos) {
        return this.readNumber(pos, 'getUint8', false);
    }

    /**
     * @returns 
     */
    readInt16BE(pos) {
        return this.readNumber(pos, 'getInt16', false);
    }

    /**
     * @returns 
     */
    readUint16BE(pos) {
        return this.readNumber(pos, 'getUint16', false);
    }

    /**
     * @returns 
     */
    readInt16LE(pos) {
        return this.readNumber(pos, 'getInt16', true);
    }

    /**
     * @returns 
     */
    readUint16LE(pos) {
        return this.readNumber(pos, 'getUint16', true);
    }

    /**
     * @returns 
     */
    readInt32BE(pos) {
        return this.readNumber(pos, 'getInt32', false);
    }

    /**
     * @returns 
     */
    readUint32BE(pos) {
        return this.readNumber(pos, 'getUint32', false);
    }

    /**
     * @returns 
     */
    readInt32LE(pos) {
        return this.readNumber(pos, 'getInt32', true);
    }

    /**
     * @returns 
     */
    readUint32LE(pos) {
        return this.readNumber(pos, 'getUint32', true);
    }

    /**
     * @returns {Number}
     */
    readInt64BE(pos) {
        return this.readNumber(pos, 'getBigInt64', false);
    }
    
    /**
     * @returns {Number}
     */
    readUint64BE(pos) {
        return this.readNumber(pos, 'getBigUint64', false);
    }

    /**
     * @returns {Number}
     */
    readInt64LE(pos) {
        return this.readNumber(pos, 'getBigInt64', true);
    }
    
    /**
     * @returns {Number}
     */
    readUint64LE(pos) {
        return this.readNumber(pos, 'getBigUint64', true);
    }

    /**
     * @returns {Number}
     */
    readFloat32BE(pos) {
        return this.readNumber(pos, 'getFloat32', false);
    }

    /**
     * @returns 
     */
    readFloat64BE(pos) {
        return this.readNumber(pos, 'getFloat64', false);
    }

    /**
     * @returns {Number}
     */
     readFloat32LE(pos) {
        return this.readNumber(pos, 'getFloat32', true);
    }

    /**
     * @returns 
     */
    readFloat64LE(pos) {
        return this.readNumber(pos, 'getFloat64', true);
    }

    /**
     * @returns 
     */
    getDataLength() {
        return this.data.length;
    }

    /**
     * mark as matched
     */
    matched() {
        this.isMatched = true;
    }

    /**
     * mark as not match
     */
    notMatch() {
        this.isMatched = false;
    }
    
    /**
     * get is matched
     * @returns {Boolean}
     */
    getIsMatched() {
        return this.isMatched;
    }
}