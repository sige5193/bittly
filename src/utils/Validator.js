export default class Validator {
    /**
     * @constructor
     * @param {*} value 
     * @param {*} options 
     */
    constructor(value,options) {
        this.value = value;
        this.options = options;
    }

    /**
     * validate by given value and options
     * @returns {Boolean}
     */
    validate() {
        let handler = `validate${this.options.handler}`;
        return this[handler]();
    }

    /**
     * check value by given handler or throw error with given message
     * @param {*} value 
     * @param {*} handler 
     * @param {*} message 
     */
    static check( value, handler, message ) {
        let validator = new Validator(value, {handler:handler});
        if ( !validator.validate() ) {
            throw Error(message);
        }
    }

    /**
     * validate empty
     * @returns {Boolean}
     */
    validateNotEmpty() {
        return !(undefined === this.value 
            || null === this.value 
            || (undefined !== this.value.length && 0 === this.value.length )
            || ('object' === typeof(this.value) && 0 === Object.keys(this.value).length)
        );
    }
}