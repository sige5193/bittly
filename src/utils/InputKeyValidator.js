import Dictionary from './Dictionary.js'
class InputKeyValidator {
    /**
     * @param {*} key 
     */
    constructor( value, key ) {
        this.value = value;
        this.key = key;
        this.dataType = null;
        this.dataTypeFormatter = null;
    }

    /**
     * @param {*} dataType 
     * @param {*} formatter 
     */
    setDataType( dataType, formatter ) {
        this.dataType = dataType;
        this.dataTypeFormatter = formatter;
    }
    
    /**
     * @returns 
     */
    validate ( ) {
        let keyHandlerMap = {
            UnsignedInteger : ['BYTE','UNSIGNED_SHORT','UNSIGNED_INT','UNSIGNED_LONG','UNISNGED_LONG_LONG'],
            SignedInteger : ['BYTE_SIGNED','SHORT','INT','LONG','LONG_LONG'],
            Float : ['FLOAT','DOUBLE'],
            ByteArray : ['BYTES'],
            String : ['STRING','CHAR','UNSIGNED_CHAR'],
        };

        let keyHandlerName = null;
        for ( let tmpHandlerName in keyHandlerMap ) {
            if ( !Dictionary.match('DIRECTIVE_PARAM_DATATYPE', keyHandlerMap[tmpHandlerName], this.dataType) ) {
                continue;
            }
            keyHandlerName = tmpHandlerName;
            break;
        }
        let keyHandler = `getAcceptKeysFrom${keyHandlerName}`;
        let acceptKeys = this[keyHandler]();
        if ( '*' === acceptKeys ) {
            return true;
        }
        let defaultAcceptKeys = [
            // 控制键
            'Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Shift','Tab',
            // 变量键
            '{','}','v','a','l','u','e'
        ];
        acceptKeys = acceptKeys.concat(defaultAcceptKeys);
        if ( -1 == acceptKeys.indexOf(this.key) ) {
            return false;
        }

        return true;
    }

    /**
     * 字符串
     * @returns 
     */
    getAcceptKeysFromString() {
        return '*';
    }

    /**
     * 字节数组
     * @returns 
     */
    getAcceptKeysFromByteArray() {
        return ' 0123456789ABCDEFabcdef'.split('');
    }
    /**
     * 浮点数
     */
    getAcceptKeysFromFloat() {
        return '-.0123456789'.split('');
    }

    /**
     * 有符号整型
     * @note 有符号整型目前仅支持十进制输入，所以不用判断格式
     */
    getAcceptKeysFromSignedInteger() {
        return '-0123456789'.split('');
    }

    /**
     * 无符号整型
     */
    getAcceptKeysFromUnsignedInteger() {
        switch ( this.dataTypeFormatter ) {
        case 'bin' : return '01'.split('');
        case 'oct' : return '01234567'.split('');
        case 'dec' : return '0123456789'.split('');
        case 'hex' : return '0123456789ABCDEFabcdef'.split('');
        }
        return [];
    }
}
export default InputKeyValidator;