import MyDate from '../../../utils/datatype/MyDate.js';
import ParameterFormBuildHandler from '../parameters/form/BuildHandler.js';
import ScriptLib from './Bittly.js'
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
            {func:'crc1',value:'{{@crc1($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc1')},
            {func:'crc8',value:'{{@crc8($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc8')},
            {func:'crc81wire',value:'{{@crc81wire($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc81wire')},
            {func:'crc16',value:'{{@crc16($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc16')},
            {func:'crc16ccitt',value:'{{@crc16ccitt($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc16ccitt')},
            {func:'crc16xmodem',value:'{{@crc16xmodem($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc16xmodem')},
            {func:'crc16kermit',value:'{{@crc16kermit($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc16kermit')},
            {func:'crc24',value:'{{@crc24($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc24')},
            {func:'crc32',value:'{{@crc32($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc32')},
            {func:'crcjam',value:'{{@crcjam($1,$2,$3,$4)}}',text:$t('directive.quickCallCrcjam')},
            {func:'crc32mpeg2',value:'{{@crc32mpeg2($1,$2,$3,$4)}}',text:$t('directive.quickCallCrc32mpeg2')},
            {func:'date',value:'{{@date(format)}}',text:$t('directive.quickCallDate')},
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
     * crc1
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc1( ... data ) {
        let crc = this.scriptLib.crc('crc1', ... data);
        return crc.toString();
    }

    /**
     * crc8
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc8( ... data ) {
        let crc = this.scriptLib.crc('crc8', ... data);
        return crc.toString();
    }

    /**
     * crc81wire
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc81wire( ... data ) {
        let crc = this.scriptLib.crc('crc81wire', ... data);
        return crc.toString();
    }

    /**
     * crc16
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc16( ... data ) {
        let crc = this.scriptLib.crc('crc16', ... data);
        return crc.toString();
    }

    /**
     * crc16ccitt
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc16ccitt( ... data ) {
        let crc = this.scriptLib.crc('crc16ccitt', ... data);
        return crc.toString();
    }

    /**
     * crc16xmodem
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc16xmodem( ... data ) {
        let crc = this.scriptLib.crc('crc16xmodem', ... data);
        return crc.toString();
    }

    /**
     * crc16kermit
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc16kermit( ... data ) {
        let crc = this.scriptLib.crc('crc16kermit', ... data);
        return crc.toString();
    }

    /**
     * crc24
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc24( ... data ) {
        let crc = this.scriptLib.crc('crc24', ... data);
        return crc.toString();
    }

    /**
     * crc32
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc32( ... data ) {
        let crc = this.scriptLib.crc('crc32', ... data);
        return crc.toString();
    }

    /**
     * crcjam
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crcjam( ... data ) {
        let crc = this.scriptLib.crc('crcjam', ... data);
        return crc.toString();
    }

    /**
     * crc32mpeg2
     * @param {Array|Object|String} data 
     * @returns {Number}
     */
    crc32mpeg2( ... data ) {
        let crc = this.scriptLib.crc('crc32mpeg2', ... data);
        return crc.toString();
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
        let buffer = ParameterFormBuildHandler.packItemsToBuffer(this.directive, items);
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

    /**
     * @param {*} format 
     * @returns {String}
     */
    date(format) {
        return MyDate.format(new Date(), format);
    }
}