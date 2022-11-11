export default class SerialPortMocker {
    /**
     * @property {Object}
     */
    static mockOptions = {};
    
    /**
     * get the device list
     */
    static list() {
        if ( undefined === SerialPortMocker.mockOptions.list ) {
            return Promise.resolve([]);
        } else {
            return SerialPortMocker.mockOptions.list();
        }
    }

    /**
     * start serialport mock
     */
    static mock(options={}) {
        SerialPortMocker.mockOptions = options;
        window.SerialPort = SerialPortMocker;
    }

    /**
     * constructor of serialport
     */
    constructor() {
        this.isOpen = false;
        this.eventHandlers = {};
    }

    /**
     * bind event hanlder
     * @param {*} name 
     * @param {*} callback 
     */
    on( name, callback ) {
        if ( undefined == this.eventHandlers[name] ) {
            this.eventHandlers[name] = [];
        }
        this.eventHandlers[name].push(callback);
    }

    /**
     * trigger evnent
     * @param {*} name 
     * @param  {...any} data 
     * @returns 
     */
    trigger( name, ... data ) {
        if ( undefined == this.eventHandlers[name] ) {
            return;
        }

        for ( let i=0; i<this.eventHandlers[name].length; i++ ) {
            this.eventHandlers[name][i](... data);
        }
    }

    /**
     * open connection
     * @param {*} callback 
     */
    open(callback) {
        if ( undefined === SerialPortMocker.mockOptions.open ) {
            callback();
        } else {
            SerialPortMocker.mockOptions.open(this, callback);
        }
    }

    /**
     * write data to serialport
     * @param {*} data 
     * @param {*} callback 
     */
    write(data, callback) {
        if ( undefined == SerialPortMocker.mockOptions.write ) {
            callback();
            setTimeout(()=> this.trigger('data', data), 10);
        } else {
            SerialPortMocker.mockOptions.write(this, data, callback);
        }
    }

    /**
     * close connection
     * @param {*} callback 
     */
    close( callback ) {
        if ( undefined == SerialPortMocker.mockOptions.write ) {
            this.isOpen = false;
            this.trigger('close',null);
            callback();
        } else {
            SerialPortMocker.mockOptions.close(this,callback);
        }

        
    }
}