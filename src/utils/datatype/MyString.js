import { NIL as NIL_UUID, v4 as uuidV4 } from 'uuid';
export default class MyString {
    /**
     * generate uuid v4 string
     * @returns {String}
     */
    static uuidV4() {
        return uuidV4();
    }

    /**
     * generate uuid nil string
     * @returns {String}
     */
    static uuidNil() {
        return NIL_UUID;
    }

    /**
     * translate message to local language
     * @param {String} key 
     * @param {Array|undefined} params 
     */
    static $t(key, params) {
        return window.app.$t(key, params);
    }

    /**
     * generate key by time
     * @returns {String}
     */
    static generateShortSecKey() {
        return Math.floor(((new Date()).getTime()/1000))
        .toString(16)
        .toUpperCase();
    }

    /**
     * @param {*} content 
     * @param {*} nlStyle 
     * @returns 
     */
    static applyNewLineStyle( content, nlStyle ) {
        content = content.replaceAll('\r\n', '\n');
        content = content.replaceAll('\r', '\n');
        if ( 'CRLF' == nlStyle ) {
            content = content.replaceAll('\n', '\r\n');
        } else if ( 'CR' == nlStyle ) {
            content = content.replaceAll('\n', '\r');
        }
        return content;
    }
}