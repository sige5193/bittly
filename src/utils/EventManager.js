export default class EventManager {
    /**
     * @constructor
     * @param {*} host 
     */
    constructor (host) {
        /**
         * instance of host object
         * @property {Object}
         */
        this.host = host;
        /**
         * list of events
         * @property {Object}
         */
        this.events = {};
        
        // setup host
        this.host.on = (eventName, callback) => this.on(eventName, callback);
        this.host.off = (eventName, callback) => this.off(eventName, callback);
        this.host.trigger = (eventName, ... data) => this.trigger(eventName, ... data);
    }

    /**
     * trigger event by given name
     * @param {*} eventName 
     * @param  {...any} data 
     */
    trigger( eventName, ... data ) {
        if ( undefined === this.events[eventName] ) {
            return ;
        }
        for ( let i=0; i<this.events[eventName].length; i++ ) {
            let callback = this.events[eventName][i];
            callback(... data);
        }
    }

    /**
     * @param {*} eventName 
     * @param {*} callback 
     */
    on( eventName, callback ) {
        if ( undefined === this.events[eventName] ) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * @param {*} eventName 
     * @param {*} callback 
     */
    off( eventName, callback ) {
        if ( undefined === this.events[eventName] ) {
            return ;
        }

        let index = this.events[eventName].indexOf(callback);
        if ( -1 != index ) {
            this.events[eventName].splice(index, 1);
        }
    }
}