export default class StatusManager {
    /**
     * @constructor
     */
    constructor () {
        this.statuses = {};
        this.listeners = [];
    }

    /**
     * add status listener
     * @param {*} callback 
     */
    addListener(callback) {
        if ( -1 == this.listeners.indexOf(callback) ) {
            this.listeners.push(callback);
        }
    }
    
    /**
     * remove status listener
     * @param {*} callback 
     * @returns 
     */
    removeListener(callback) {
        let index = this.listeners.indexOf(callback);
        if ( -1 != index ) {
            this.listeners.splice(index,1);
        }
    }

    /**
     * update status list
     * @param {*} statuses 
     */
    updateStatusList( statuses ) {
        let names = [];
        
        // append new status
        for ( let i=0; i<statuses.length; i++ ) {
            let item = statuses[i];
            if ( -1 == names.indexOf(item.name) ) {
                names.push(item.name);
            }
            
            if ( undefined === this.statuses[item.name] ) {
                this.statuses[item.name] = item.defaultValue;
            }
        }
        
        // delete old status
        let keys = Object.keys(this.statuses);
        for ( let i=0; i<keys.length; i++ ) {
            let key = keys[i];
            if ( -1 === names.indexOf(key) ) {
                delete this.statuses[key];
            }
        }
    }
    
    /**
     * get value by given name
     * @param {*} name 
     */
    getValueByName(name) {
        if ( undefined === this.statuses[name] ) {
            throw Error('status not exists');
        }
        return this.statuses[name];
    }

    /**
     * set value by given name
     * @param {*} name 
     * @param {*} value 
     */
    setValueByName(name, value) {
        if ( undefined === this.statuses[name] ) {
            throw Error('status not exists');
        }
        this.statuses[name] = value;
        for( let i=0; i<this.listeners.length; i++ ) {
            this.listeners[i](name, value);
        }
    }
}