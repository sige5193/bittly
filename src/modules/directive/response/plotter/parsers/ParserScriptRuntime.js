import Common from '../../../../../utils/Common.js'
export default class ChannelParserCustomScriptRuntime {
    /**
     * constructor of custom script runtime
     */
    constructor () {
        /**
         * @property {Buffer|null}
         */
        this.data = null;
        /**
         * @property {DataView}
         */
        this.dataview = null;
        /**
         * @property {Array<Array<Number>>}
         */
        this.channels = [];
        /**
         * @property {Array<String>}
         */
        this.channelNames = [];
        /**
         * @property {Number}
         */
        this.cursor = 0;
    }

    /**
     * set parser data.
     * @param {Buffer} data 
     */
    setData( data ) {
        this.data = data;
        this.dataview = Common.convertBufferToDataView(data);
    }

    /**
     * create an channel and get the channel id
     * @returns {Number}
     */
    channelAdd(name) {
        if ( undefined == name ) {
            name = `CH ${this.channels.length}`;
        }
        this.channelNames.push(name);
        return this.channels.push([]) - 1;
    }
    
    /**
     * push data to channel
     * @param {Number} cid 
     * @param {Number} data 
     */
    channelDataPush(cid, data) {
        this.channels[cid].push(data);
    }

    /**
     * read number from given data buffer.
     * @param {*} handler 
     * @param {*} data 
     * @param {*} index 
     * @param {*} isLittleEndian 
     * @returns {Number}
     */
    readNumber(handler, isLittleEndian ) {
        return this.dataview[handler](this.cursor, isLittleEndian);
    }

    /**
     * @returns 
     */
    readInt8() {
        let num = this.readNumber('getInt8', false);
        this.cursor += 1;
        return num;
    }

    /**
     * @returns 
     */
    readUint8() {
        let num = this.readNumber('getUint8', false);
        this.cursor += 1;
        return num;
    }

    /**
     * @returns 
     */
    readInt16BE() {
        let num = this.readNumber('getInt16', false);
        this.cursor += 2;
        return num;
    }

    /**
     * @returns 
     */
    readUint16BE() {
        let num = this.readNumber('getUint16', false);
        this.cursor += 2;
        return num;
    }

    /**
     * @returns 
     */
    readInt16LE() {
        let num = this.readNumber('getInt16', true);
        this.cursor += 2;
        return num;
    }

    /**
     * @returns 
     */
    readUint16LE() {
        let num = this.readNumber('getUint16', true);
        this.cursor += 2;
        return num;
    }

    /**
     * @returns 
     */
     readInt32BE() {
        let num = this.readNumber('getInt32', false);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns 
     */
    readUint32BE() {
        let num = this.readNumber('getUint32', false);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns 
     */
    readInt32LE() {
        let num = this.readNumber('getInt32', true);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns 
     */
    readUint32LE() {
        let num = this.readNumber('getUint32', true);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns {Number}
     */
    readInt64BE() {
        let num = this.readNumber('getBigInt64', false);
        this.cursor += 8;
        return num;
    }
    
    /**
     * @returns {Number}
     */
    readUint64BE() {
        let num = this.readNumber('getBigUint64', false);
        this.cursor += 8;
        return num;
    }

    /**
     * @returns {Number}
     */
    readInt64LE() {
        let num = this.readNumber('getBigInt64', true);
        this.cursor += 8;
        return num;
    }
    
    /**
     * @returns {Number}
     */
    readUint64LE() {
        let num = this.readNumber('getBigUint64', true);
        this.cursor += 8;
        return num;
    }

    /**
     * @returns {Number}
     */
    readFloat32BE() {
        let num = this.readNumber('getFloat32', false);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns 
     */
    readFloat64BE() {
        let num = this.readNumber('getFloat64', false);
        this.cursor += 8;
        return num;
    }

    /**
     * @returns {Number}
     */
     readFloat32LE() {
        let num = this.readNumber('getFloat32', true);
        this.cursor += 4;
        return num;
    }

    /**
     * @returns 
     */
    readFloat64LE() {
        let num = this.readNumber('getFloat64', true);
        this.cursor += 8;
        return num;
    }

    /**
     * @returns 
     */
    getDataLength() {
        return this.data.length;
    }

    /**
     * @returns 
     */
    getCursor() {
        return this.cursor;
    }

    /**
     * @param {*} offset 
     */
    moveCursor( offset ) {
        this.cursor += offset;
    }

    /**
     * @param {*} cursor 
     */
    setCursor( cursor ) {
        this.cursor = cursor;
    }
}