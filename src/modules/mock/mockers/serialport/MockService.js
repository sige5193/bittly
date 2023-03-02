import Common from '../../../../utils/Common.js';
import MyObject from '../../../../utils/datatype/MyObject.js'
import ResponseDataGenerator from '../../response/DataGenerator.js'
import RequestMatcher from '../../response/match/RequestMatcher.js';
import StatusManager from '../../status/StatusManager.js';
import MockServiceBase from '../MockServiceBase.js';
export default class Mocker extends MockServiceBase {
    /**
     * @constructor
     * @param {MdbMock} mock 
     */
    constructor(mock) {
        super(mock);
        /**
         * instance of serialport
         * @property {SerialPort}
         */
        this.serialport = null;
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
         * size of receive data
         * @property {Number}
         */
        this.dataReceiveSize = 0;
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
        this.validate('NotEmpty',this.options.path,'pathCanNotBeEmpty');
        this.validate('NotEmpty',this.options.baudRate,'baudRateCanNotBeEmpty');
        this.validate('NotEmpty',this.options.dataBits,'dataBitsCanNotBeEmpty');
        this.validate('NotEmpty',this.options.stopBits,'stopBitsCanNotBeEmpty');
        this.validate('NotEmpty',this.options.parity,'parityCanNotBeEmpty');

        this.serialport = new window.SerialPort({
            path : this.options.path,
            baudRate: parseInt(this.options.baudRate),
            dataBits: parseInt(this.options.dataBits),
            stopBits: parseInt(this.options.stopBits),
            parity: this.options.parity,
            autoOpen: false,
        });
        
        this.serialport.on('open', () => this.handleOnSerialPortOpen());
        this.serialport.on('error', err => this.handleSerialportError(err));
        this.serialport.on('close', err => this.handleOnSerialPortClose(err));
        this.serialport.on('data', data => this.handleOnSerialPortData(data));
        await this.serialportOpen();
        this.serviceOnline();
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.serialport.close( err => {
                if ( err ) {
                    reject($this.$t('unableToClose', [err.message]));
                }
                $this.serviceOffline();
                resolve();
            });
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
        entry.time = new Date();
        entry.dir = 'send';
        entry.data = generator.generate(entry);
        this.dataEntries.push(entry);
        this.eventManager.trigger('send', entry);

        await this.serialportWrite(entry.data);
    }

    /**
     * write data to serialport
     * @param {*} data 
     * @returns 
     */
    serialportWrite( data ) {
        let logData = ('hex'===this.options.encoding) ? data.toString('hex') : data.toString();
        this.log(`(write ${this.options.encoding}) : `, logData);
        let $this = this;
        return new Promise(( resolve, reject ) => {
            if ( 0 === data.length || !$this.serialport.isOpen ) {
                return resolve();
            }
            $this.serialport.write(data, err => {
                if (undefined !== err) {
                    return reject($this.$t('unableToWrite', [$this.options.path, err.message]));
                }
            });
            $this.serialport.drain(() => {
                $this.dataSendSize += data.length;
                resolve();
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
     * event handler on serialport drain
     * @param {*} data 
     * @param {*} resolve 
     * @param {*} reject 
     */
    handleOnSerialPortDrain( data, resolve, reject ) {
        let isSuccess = this.serialport.write(data);
        if ( !isSuccess ) {
            this.serialport.once('drain', () => this.handleOnSerialPortDrain(data, resolve, reject));
        }
        resolve();
    }

    /**
     * event handler on serialport receive data
     * @param {*} data 
     */
    async handleOnSerialPortData( data ) {
        let logData = ('hex'===this.options.encoding) ? data.toString('hex') : data.toString();
        this.log(`(receive ${this.options.encoding}) : `, logData);
        this.dataReceiveSize += data.length;

        let entry = {};
        entry.handler = 'Hex';
        entry.time = new Date();
        entry.dir = 'receive';
        entry.data = Buffer.from(data);
        
        // try to merge incoming data
        if ( this.mock.options.enableDataMerge ) {
            let nowTime = (new Date()).getTime();
            let mergeTime = parseInt(this.mock.options.dataMergeTime || 0);
            let lastEntry = this.dataEntries[this.dataEntries.length - 1];
            if ( undefined !== lastEntry 
            && 'receive' == lastEntry.dir 
            && (nowTime - lastEntry.time.getTime()) < mergeTime ) {
                lastEntry.data = Buffer.concat([lastEntry.data, Buffer.from(entry.data)]);
                entry = this.dataEntries.pop();
            }
        }
        
        // match request
        let matcher = new RequestMatcher(this.options.responseMatchRules);
        let rules = matcher.match(entry.data);
        
        // update entry name
        let names = [];
        rules.forEach(item => names.push(item.name));
        if ( 0 < names.length ) {
            entry.name = window.app.$t('mock.response.match.entryName',[names.join('; ')]);
        } else {
            entry.name = window.app.$t('mock.response.match.entryNameNotMatch');
        }
        this.dataEntries.push(entry);
        this.eventManager.trigger('receive', entry);

        await this.sendContentsByMatchedRules(rules);
    }

    /**
     * send contents by rule list
     * @param {Array<Object>} rules 
     */
    async sendContentsByMatchedRules( rules ) {
        for ( let i=0; i<rules.length; i++ ) {
            let content = MyObject.copy(rules[i].responseContent);
            if ( undefined === content ) {
                continue;
            }
            content.name = window.app.$t('mock.response.match.entryName',[rules[i].name]);
            content.handler = rules[i].responseHandler;
            this.log(`matched "${rules[i].name}"`);
            await this.send(content);
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
     * callback handler on serialport error
     * @param {Error} err 
     */
    handleSerialportError(err) {
        this.toast('eventError',[err.message],'error');
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
}