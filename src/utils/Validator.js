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