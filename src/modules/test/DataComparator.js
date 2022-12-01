import Common from '../../utils/Common.js'
export default class DataComparator {
    /**
     * @constructor
     */
    constructor() {
        /**
         * name of comparator type
         * @public
         * @property {String}
         */
        this.type = null;
        /**
         * value of expect data
         * @public
         * @property {String|Array}
         */
        this.expectData = null;
        /**
         * instance of directive directive
         * @public
         * @property {Executor}
         */
        this.executor = null;
        /**
         * length of data to read
         * @public
         * @property {integer}
         */
        this.dataLength = null;
        /**
         * value of actual data.
         * @private
         * @property {any}
         */
        this.actualData = null;
        /**
         * @property {Boolean}
         */
        this.isMatched = false;
        /**
         * @property {Array}
         */
        this.matchResult = [];
    }

    /**
     * @returns {Boolean}
     */
    compare() {
        let actualData = null;
        let handler = null;
        switch ( this.type ) {
        case 'text' : actualData = this.executor.getResponseAsString(); handler = 'compareText'; break;
        case 'hex' : actualData = this.executor.getResponseAsBytes(); handler = 'compareHex'; break;
        case 'form' : actualData = this.executor.getResponseAsForm(); handler = 'compareForm'; break;
        default : throw Error(`comparator type "${this.type}" is not supported.`);
        }

        this.executor.moveCursor(this.dataLength);
        this.actualData = actualData;
        this.isMatched = this[handler]();
        return this.isMatched;
    }
    
    /**
     * get is matched
     * @returns {Boolean}
     */
    getIsMatched() {
        return this.isMatched;
    }

    /**
     * compare result with format string handler
     */
    compareText( ) {
        this.matchResult = [];
        let regex = new RegExp(`^${this.expectData}$`, 'gm');
        let match = regex.exec(this.actualData);
        return null != match;
    }

    /**
     * compare result with format hex handler
     */
    compareHex() {
        debugger
        let expectData = Common.convertStringToHex(this.expectData);
        let length = Math.max(expectData.length, this.actualData.length);
        
        let isMatched = true;
        this.matchResult = [];
        for ( let i=0; i<length; i++ ) {
            let isPartMatch = this.actualData[i] === expectData[i];
            isMatched = isMatched && isPartMatch;
            this.matchResult.push(isPartMatch);
        }

        return isMatched;
    }

    /**
     * comparent result with format form handler
     */
    compareForm() {
        this.matchResult = [];

        let isSame = true;
        for ( let i=0; i<this.expectData.length; i++ ) {
            let isMatched = this.compareFormItem(i);
            isSame = isSame && isMatched;
            this.matchResult.push(isMatched);
        }

        return isSame;
    }

    /**
     * compare form item
     * @param {Number} index
     * @returns {Boolean}
     */
    compareFormItem(index) {
        let expect = this.expectData[index];
        let expectValue = expect.value;
        let actualValue = this.actualData.getValueByIndex(index);
        if ( undefined == actualValue ) {
            return false;
        }

        if ( window.app.$dict.match('DIRECTIVE_PARAM_DATATYPE','BYTES', expect.type) ) {
            expectValue = expectValue.replaceAll(/\s/g,'');
            actualValue = actualValue.replaceAll(/\s/g,'');
        }

        // raw compare (string)
        switch( expect.comparator ) {
        case 'Ignore' : return true;
        case 'Equal'  : return expectValue === actualValue;
        case 'NotEqual' : return expectValue !== actualValue;
        case 'Contains' : return -1 != actualValue.indexOf(expectValue);
        case 'NotContains' : return -1 == actualValue.indexOf(expectValue);
        }

        // convert to number and compare
        let expectNumber = expectValue * 1;
        let actualNumber = actualValue * 1;
        switch ( expect.comparator ) {
        case 'Greater' : return actualNumber > expectNumber;
        case 'GreaterOrEqual' : return actualNumber >= expectNumber;
        case 'Less' : return actualNumber < expectNumber;
        case 'LessOrEqual' : return actualNumber <= expectNumber;
        }

        // handle between 
        let expectRang = expectValue;
        switch ( expect.comparator ) {
        case 'Between' : return actualNumber >= expectRang[0] && actualNumber <= expectRang[1];
        case 'NotBetween' : return actualNumber < expectRang[0] || actualNumber > expectRang[1];
        }

        // unable to handle the comparation
        return false;
    }
}