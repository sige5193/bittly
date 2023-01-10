import Logger from '../../../../utils/Logger.js'
import MyObject from '../../../../utils/datatype/MyObject.js'
import ResponseDataGenerator from '../../response/DataGenerator.js'
import RequestMatcher from '../../response/match/RequestMatcher.js';
import StatusManager from '../../status/StatusManager.js';
export default class Mocker {
    /**
     * @constructor
     * @param {MdbMock} mock 
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
         * instance of serialport
         * @property {SerialPort}
         */
        this.serialport = null;
        /**
         * name of mock type
         * @property {String}
         */
        this.type = 'serialport';
        /**
         * list of data entries
         * @property {Array<Object>}
         */
        this.dataEntries = [];
        /**
         * size of send data
         * @property {Number}
         */
        this.dataSendSize = 0;
        /**
         * runtime status
         * @property {StatusManager}
         */
        this.status = new StatusManager();
        this.status.updateStatusList(this.options.status);
    }

    /**
     * start mock serviec
     * @returns {Promise<void>}
     */
    async start() {
        this.serialport = new window.SerialPort({
            path : this.options.path,
            baudRate: parseInt(this.options.baudRate),
            dataBits: parseInt(this.options.dataBits),
            stopBits: parseInt(this.options.stopBits),
            parity: this.options.parity,
            autoOpen: false,
        });
        
        this.serialport.on('open', () => this.handleOnSerialPortOpen());
        this.serialport.on('close', err => this.handleOnSerialPortClose(err));
        this.serialport.on('data', data => this.handleOnSerialPortData(data));
        await this.serialportOpen();
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialport.close( err => err 
                ? reject($this.$t('unableToClose', [err.message])) 
                : resolve()
            );
        });
    }

    /**
     * send response by given content
     * @param {Object} content 
     */
    async send( content ) {
        let entry = MyObject.copy(content);
        let generator = new ResponseDataGenerator({
            status : this.status,
            requestData : {},
        });
        entry.dir = 'send';
        entry.data = generator.generate(entry);
        this.dataEntries.push(entry);
        
        await this.serialportWrite(entry.data);
    }

    /**
     * write data to serialport
     * @param {*} data 
     * @returns 
     */
    serialportWrite( data ) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialport.write(data, err => {
                if (err) {
                    reject($this.$t('unableToWrite', [err.message]));
                } else {
                    $this.dataSendSize += data.length;
                    resolve();
                }
            });
        });
    }

    /**
     * open serialport connection
     * @private
     * @returns {Promise<void>}
     */
    serialportOpen() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialport.open(err => err 
                ? reject($this.$t('unableToOpen', [err.message])) 
                : resolve()
            );
        });
    }

    /**
     * event handler on serialport receive data
     * @param {*} data 
     */
    handleOnSerialPortData( data ) {
        let matcher = new RequestMatcher(this.options.responseMatchRules);
        let rules = matcher.match(data);
        for ( let i=0; i<rules.length; i++ ) {
            let content = MyObject.copy(rules[i].responseContent);
            content.handler = rules[i].responseHandler;
            this.send(content);
        }
    }

    /**
     * event handler on 
     * @private
     */
    handleOnSerialPortOpen() {
        this.log('opened');
    }

    /**
     * hanle event on serial port closed
     * @private
     * @param {Error} err 
     */
    handleOnSerialPortClose( err ) {
        if ( null != err && undefined != err.disconnected && true === err.disconnected ) {
            this.toast('disconnected',[this.options.path],'warning');
        }
        this.log('close');
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