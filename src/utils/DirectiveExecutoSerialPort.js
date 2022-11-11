/**
 * 串口指令执行器
 * @author sige
 */
class DirectiveExecutoSerialPort {
    /**
     * serial port executor instances
     */
    static instances = {};
    
    /**
     * setup a new instance or get from exists one
     * @param {*} options 
     */
    static setup( options ) {
        if ( undefined == DirectiveExecutoSerialPort.instances[options.path] ) {
            DirectiveExecutoSerialPort.instances[options.path] = new DirectiveExecutoSerialPort(options);
        }
        let exector = DirectiveExecutoSerialPort.instances[options.path];
        exector.eventHandlerOnData = null;
        return exector;
    }

    /**
     * list all availabel serial ports
     */
    static async portList() {
        let ports = await window.SerialPort.list();
        return ports;
    }

    /**
     * constructor of exector
     * @param {Object} options
     * - onData : callback function
     */
    constructor(options) {
        this.options = options;
        this.serialPort = new window.SerialPort({
            path : options.path,
            baudRate: parseInt(options.baudRate),
            dataBits: parseInt(options.dataBits),
            stopBits: parseInt(options.stopBits),
            parity: options.parity,
            autoOpen: false,
        });
        this.eventHandlerOnData = null;
        
        let $this = this;
        this.serialPort.on('open', () => $this.handleOnOpen());
        this.serialPort.on('data', (data) => $this.handleOnData(data));
    }

    /**
     * set on data handler
     * @param {*} handler 
     */
    onData( handler ) {
        this.eventHandlerOnData = handler;
    }

    /**
     * handle event on serial port opened.
     */
    handleOnOpen() {
        console.log(`[DirectiveExecutoSerialPort] serial port ${this.options.path} open successed`);
    }

    /**
     * handle event on serial port has data come in
     * @param {*} data 
     */
    handleOnData(data) {
        console.log("[DirectiveExecutoSerialPort] Data received: ", data);
        if ( null != this.eventHandlerOnData ) {
            this.eventHandlerOnData(data);
        }
    }

    /**
     * open serial port
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            if ( $this.serialPort.isOpen ) {
                resolve();
                return ;
            }
            $this.serialPort.open(function (err) {
                if (err) {
                    reject(`unable to open serial port : ${err.message}`);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * write data to serial port
     * @param {*} data 
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialPort.write(data, function(err) {
                if (err) {
                    reject(`Error on write: ${err.message}`);
                }
                resolve();
              });
        });
    }

    /**
     * close the serial port
     */
    close() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialPort.close(function( error ) {
                error ? reject(error.message) : resolve();
            });
        });
    }
}

export default DirectiveExecutoSerialPort;