import Common from '../../utils/Common.js'
import MyNumber from '../../utils/datatype/MyNumber.js';
import MyString from '../../utils/datatype/MyString.js';
import Dictionary from '../../utils/Dictionary.js';
import * as math from 'mathjs'
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
        /**
         * @property {Boolean}
         */
        this.textRegexEnable = false;
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
        if ( null === this.expectData || undefined === this.expectData ) {
            return false;
        }

        if ( this.textRegexEnable ) {
            this.matchResult = [];
            let regex = new RegExp(this.expectData, 'gm');
            let match = regex.exec(this.actualData);
            return null != match;
        }

        let expect = MyString.applyNewLineStyle(this.expectData, this.executor.directive.nlstyle);
        expect = MyString.convertEscapeStringToRealString(expect);
        return expect == this.actualData;
    }

    /**
     * compare result with format hex handler
     */
    compareHex() {
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
        let fields = this.expectData;
        if ( null === this.expectData || undefined === this.expectData ) {
            fields = [];
        }

        let isSame = true;
        for ( let i=0; i<fields.length; i++ ) {
            let isMatched = this.compareFormItem(fields[i], i);
            isSame = isSame && isMatched;
            this.matchResult.push(isMatched);
        }
        return isSame;
    }

    /**
     * compare form item
     * @param {any} expect
     * @returns {Boolean}
     */
    compareFormItem(expect, index) {
        if ( 'Ignore' === expect.comparator ) {
            return true;
        }

        let actualValue = this.actualData.getValueByIndex(index);
        if ( undefined == actualValue ) {
            return false;
        }

        let reverse = 'Not' === expect.comparator.substr(0, 3);
        let comparatorGroupName = reverse ? expect.comparator.substr(3) : expect.comparator;
        if ( 'Between' === comparatorGroupName ) {
            let expectRang = {};
            expectRang.min = expect.value[0];
            expectRang.max = expect.value[1];
            let actualNumber = this.getFormItemNumberValueFromActualData(index);
            let isMatched = math.largerEq(actualNumber, expectRang.min) && math.smallerEq(actualNumber, expectRang.max);
            return reverse ? !isMatched : isMatched;
        }

        let expectValue = expect.value;
        if ( 'string' === typeof(expectValue) 
        && !Dictionary.match('DIRECTIVE_PARAM_DATATYPE','STRING', expect.type) ) {
            expectValue = expectValue.replaceAll(/\s/g,'').toUpperCase();
            actualValue = actualValue.replaceAll(/\s/g,'').toUpperCase();
        }

        // raw compare (string)
        switch( expect.comparator ) {
        case 'Equal'  : return expectValue === actualValue;
        case 'NotEqual' : return expectValue !== actualValue;
        case 'Contains' : return -1 != actualValue.indexOf(expectValue);
        case 'NotContains' : return -1 == actualValue.indexOf(expectValue);
        }

        // convert to number and compare
        let field = this.actualData.directive.responseFormatter.fields[index];
        let prefix = {bin:'0b',oct:'0',dec:'',hex:'0x'}[field.format];
        let expectNumber = null;
        try {
            expectNumber = math.number(`${prefix}${expectValue}`);
        } catch {
            return false;
        }
        
        let actualNumber = this.getFormItemNumberValueFromActualData(index);
        switch ( expect.comparator ) {
        case 'Greater' : return math.larger(actualNumber, expectNumber);
        case 'GreaterOrEqual' : return math.largerEq(actualNumber, expectNumber);
        case 'Less' : return math.smaller(actualNumber, expectNumber);
        case 'LessOrEqual' : return math.smallerEq(actualNumber, expectNumber);
        }

        return false;
    }

    /**
     * get form item number value from actual data
     * @param {*} index 
     * @returns {Number}
     */
    getFormItemNumberValueFromActualData( index ) {
        let actualValue = this.actualData.getValueByIndex(index);
        if ( undefined == actualValue ) {
            return false;
        }

        let field = this.actualData.directive.responseFormatter.fields[index];
        let prefix = {bin:'0b',oct:'0',dec:'',hex:'0x'}[field.format];
        return math.number(`${prefix}${actualValue}`);
    }
}