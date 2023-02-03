import ScriptLib from './ScriptLib.js'
export default class QuickCallLib {
    /**
     * get list of quick call functions.
     * @returns {Array<Object>}
     */
    static list() {
        let $t = key => window.app.$t(key);
        return [
            {func:'crc16modbus', value:'{{@crc16modbus($1,$2,$3,$4)}}', text:$t('directive.quickCallCrc16modbus')},
            {func:'random', value:'{{@random(min,max)}}', text:$t('directive.quickCallRandom')}, 
            {func:'lrc',value:'{{@lrc(items, ...)}}', text:$t('directive.quickCallLrc')},
            {func:'checksum8',value:'{{@checksum8(items, ...)}}',text:$t('directive.quickCallChecksum8')},
            {func:'bcc',value:'{{@bcc(items, ...)}}',text:$t('directive.quickCallBcc')},
            {func:'fill',value:'{{@fill(content,count)}}',text:$t('directive.quickCallFill')},
        ];
    }

    /**
     * @param {*} directive 
     */
    constructor( directive ) {
        this.directive = directive;
        this.scriptLib = new ScriptLib(directive);
    }

    /**
     * generate value by given content repeats given count.
     * @param {*} content 
     * @param {*} count 
     * @returns {String}
     */
    fill( content, count ) {
        return content.repeat(count);
    }

    /**
     * CRC16 Modbus
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc16modbus( ... data ) {
        let crc = this.scriptLib.crc('crc16modbus', ... data);
        let resultBuffer = Buffer.alloc(2);
        let resultView = new DataView(resultBuffer.buffer);
        resultView.setUint16(0, crc);
        let result = resultView.getUint16(0, true);
        return result.toString();
    }

    /**
     * generate randome value
     * @param {*} min 
     * @param {*} max 
     * @returns 
     */
    random(min,max) {
        let range = max - min;
        let rand = Math.random();
        let result = min * 1 + Math.round(rand * range);
        return result.toString();
    }

    /**
     * echo 
     * @param {*} content 
     * @returns 
     */
    echo ( content ) {
        return content;
    }

    /**
     * lrc
     * @param  {...any} items 
     * @returns 
     */
    lrc( ... items ) {
        let sum = this.scriptLib.bytesSum(... items);
        let result = 256 - sum % 256;
        return result.toString();
    }

    /**
     * checksum 8 bit
     * @param  {...any} items 
     * @returns 
     */
    checksum8( ... items ) {
        let sum = this.scriptLib.bytesSum(... items);
        if(sum > 255) {
            sum = 255 - sum % 256;
            sum = sum + 1;
        }
        return sum.toString()
    }

    /**
     * BCC
     * @param  {...any} items 
     * @returns 
     */
    bcc( ... items ) {
        let buffer =  this.scriptLib.buildBufferFromValueItems(items);
        let result = null;
        for ( let bi=0; bi<buffer.length; bi++ ) {
            let byte = buffer[bi];
            if ( null === result ) {
                result = byte;
            } else {
                result ^= byte;
            }
        }
        return result.toString();
    }
}