import EventManager from "../../../utils/EventManager";
import Logger from "../../../utils/Logger";
import Validator from "../../../utils/Validator";
export default class MockServiceBase {
    /**
     * @constructor
     * @param {*} mock 
     */
    constructor(mock) {
        /**
         * instance of mock model
         * @property {MdbMock}
         */
        this.mock = mock;
        /**
         * options for mock service
         * @property {Object}
         */
        this.options = mock.options;
        /**
         * event manager
         * @property {EventManager}
         */
        this.eventManager = new EventManager(this);
        /**
         * key of mock service
         * @property {String}
         */
        this.key = this.mock.id;
    }

    /**
     * start mock service
     * @public
     * @abstract
     * @returns {Promise<void>}
     */
    start() {
        throw Error("start() method is not implemented");
    }

    /**
     * stop mock service
     * @public
     * @abstract
     * @returns {Promise<void>}
     */
    stop() {
        throw Error("stop() method is not implemented");
    }

    /**
     * validate value by
     * @param {*} validatorName 
     * @param {*} value 
     * @param {*} message 
     * @param {*} options 
     */
    validate(validatorName, value, message, options={} ) {
        options.handler = validatorName;
        let validator = new Validator(value, options);
        if ( ! validator.validate() ) {
            throw Error(this.$t(message));
        }
    }

    /**
     * online the mock service
     */
    serviceOnline() {
        window.app.$store.commit('mockStart', this);
    }

    /**
     * offline the mock service
     */
    serviceOffline() {
        window.app.$store.commit('mockStop', this.key);
    }

    /**
     * show toast message
     * @protected
     * @param {String} msgKey 
     * @param {Array|undefined} msgParams 
     * @param {String|undefined} type 
     */
    toast(msgKey, msgParams,type) {
        if ( undefined === type  ) {
            type = 'warning';
        }
        window.app.$message[type](this.$t(msgKey, msgParams));
    }

    /**
     * log messages
     * @protected
     * @param  {...any} args 
     */
    log( ... args ) {
        args.unshift(`[MOCK (${this.mock.name})]`)
        console.log(... args);
    }

    /**
     * @protected
     * @param  {...any} args 
     * @returns 
     */
    $t( ... args ) {
        let key = args.shift();
        key = `mock.mockers.${this.mock.type}.${key}`;
        let message = window.app.$t(key, ... args);
        return message;
    }
}