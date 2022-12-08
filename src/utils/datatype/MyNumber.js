import { Buffer } from 'buffer';
class MyNumber {
    /**
     * add 0 to head of number.
     * @param {Number} num 
     * @param {Number} count 
     * @returns {String}
     */
    static prependZero( num, count ) {
        return (Array(count).join(0) + num).slice(-count);
    }

    /**
     * parse number by radix name
     * @param {String} value 
     * @param {String} radix 
     * @returns {Number}
     */
    static parseNumberByRadixName( value, radix, bigInt=false ) {
        let prefixMap = {bin:'0b',oct:'0o',dec:'',hex:'0x'};
        let number = `${prefixMap[radix]}${value}`;
        number = number.replace(/\s/g,'');
        return bigInt ? BigInt(number) : Number(number);
    }

    /**
     * parser string to integer
     * @param {String} str
     * @returns {Number} 
     */
    static parseInteger( str ) {
        let radix = 10;
        if ( '0X' == str.substring(0,2).toUpperCase() ) {
            radix = 16;
            str = str.substring(2);
        } else if ( '0' == str[0] && 1 < str.length ) {
            radix = 8;
            str = str.substring(1);
        }
        let num = parseInt(str, radix);
        return num;
    }
    
    /**
     * @param {*} source 
     * @returns 
     */
    static fromString( source ) {
        let num = new MyNumber();
        num.source = source;
        num.sourceType = 'String';
        return num;
    }

    /**
     * get a random number between `min` and `max`.
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    static random( min, max ) {
        let range = max - min;
        let rand = Math.random();
        return min * 1 + Math.round(rand * range);
    }

    // constructor
    constructor() {
        this.source = null;
        this.sourceType = null;
        this.sourceRadix = null;
        this.isBigEndian = false;
        this.byteLength = null;
        this.isUnsigned = true;
        this.isInteger = true;
    }

    // 设置字节长度
    setByteLength( length ) {
        this.byteLength = length;
    }

    // 设置进制位数
    setRadix( radix ) {
        if ( 'string' === typeof(radix) ) {
            let radixMap = {bin:2,oct:8,dec:10,hex:16};
            radix = radixMap[radix];
        }
        this.sourceRadix = radix;
    }

    // 启用大端模式
    setIsBigEndian( isBigEndian ) {
        this.isBigEndian = isBigEndian;
    }

    // 是否为无符号
    setIsUnsigned( isUnsigned ) {
        this.isUnsigned = isUnsigned;
    }

    // 设置是否为整型
    setIsInteger( isInteger ) {
        this.isInteger = isInteger;
    }

    // 获取数值
    getNumber() {
        let num = this.source;
        let numStr = this.source.replace(/\s/g,'');
        if ( 'String' === this.sourceType && this.isInteger ) {
            if ( 8 > this.byteLength ) {
                num = parseInt(numStr, this.sourceRadix);
            } else {
                let preMap = {2:'0b',8:'0o',10:'',16:'0x'};
                num = `${preMap[this.sourceRadix]}${numStr}`;
                num = BigInt(num);
            }
        } else if ( 'String' === this.sourceType && !this.isInteger ) {
            num = parseFloat(this.source);
        }
        return num;
    }

    // 转换为Buffer
    toBuffer() {
        let buffer = new ArrayBuffer(this.byteLength);
        let view = new DataView(buffer);
        
        let viewSetHandler = `set${this.byteLength==8? 'Big':''}Uint${this.byteLength*8}`;
        if ( !this.isUnsigned ) {
            viewSetHandler = `set${this.byteLength==8? 'Big':''}Int${this.byteLength*8}`;
        }
        if ( !this.isInteger ) {
            viewSetHandler = `setFloat${this.byteLength*8}`;
        }
        let num = this.getNumber();
        view[viewSetHandler](0, num, !this.isBigEndian);
        let data = Buffer.from(view.buffer);
        return data;
    }
}

export default MyNumber;