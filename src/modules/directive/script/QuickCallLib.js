import ScriptLib from './ScriptLib.js'
export default class QuickCallLib {
    /**
     * @param {*} directive 
     */
    constructor( directive ) {
        this.directive = directive;
        this.scriptLib = new ScriptLib(directive);
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
        debugger
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
        let result = null;
        for ( let i=0; i<items.length; i++ ) {
            let bytes = this.scriptLib.valueToBytes(items[i]);
            for ( let bi=0; bi<bytes.length; bi++ ) {
                if ( null === result ) {
                    result = bytes[bi];
                } else {
                    result ^= bytes[bi];
                }
            }
        }
        return result.toString();
    }
}