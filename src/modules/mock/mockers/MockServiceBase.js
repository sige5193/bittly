import EventManager from "../../../utils/EventManager";
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
        let message = args.shift();
        message = `[MOCK (${this.mock.name})] ${message}`;
        Logger.log({stackIndex:3,message:message,params:args});
    }

    /**
     * @protected
     * @param  {...any} args 
     * @returns 
     */
    $t( ... args ) {
        let key = args.shift();
        key = `mock.mockers.${this.type}.${key}`;
        let message = window.app.$t(key, ... args);
        return message;
    }
}