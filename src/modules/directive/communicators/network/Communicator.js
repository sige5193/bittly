import Common from "@/utils/Common";
import CommunicatorBase from '../CommunicatorBase.js'
/**
 * communicator for network
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * network instances
     */
    static instances = {};

    /**
     * get network instance by options
     * @param {*} options 
     * @returns 
     */
    static async setup( options ) {
        let key = Communicator.generateKeyFromOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        return exector;
    }

    /**
     * Generate device key by given options
     * @param {*} options 
     */
     static generateKeyFromOptions( options ) {
        let keys = ['Network'];
        keys.push(options.protocol);
        keys.push(options.host);
        keys.push(options.port);
        return keys.join(':');
    }

    /**
     * constructor of exector
     * @param {Object} options
     * - onData : callback function
     */
    constructor(options) {
        super(options);
        this.deviceType = 'network';
        if ( Common.isEmpty(this.options.protocol) ) {
            throw Error(this.$t('protocolCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.options.host) ) {
            throw Error(this.$t('hostCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.options.port) ) {
            throw Error(this.$t('portCannotBeEmpty'));
        }

        this.timeDelayBeforeFirstWrite = 100;
        this.comkey = `Network:${options.protocol}:${options.host}:${options.port}`;
        this.isConnected = false;
        this.options.host = this.applyEnvPlaceholderVariables(this.options.host);
        this.options.port = this.applyEnvPlaceholderVariables(this.options.port);
        
        this.title = `${options.protocol} ${options.host}:${options.port}`;
        if ( 'TCP' == this.options.protocol ) {
            this.connection = new window.net.Socket();
            this.connection.on('data', (data) => this.handleOnData(data));
            this.connection.on('error',(err) => this.handleOnError(err));
            this.connection.on('close',(err) => this.handleOnClose(err));
            this.connectReject = null;
        } else if ( 'UDP' == this.options.protocol ) {
            this.connection = window.dgram.createSocket('udp4');
            this.connection.on('close',() => this.handleOnClose(false));
            this.connection.on('message', (data) => this.handleOnData(data));
            this.connection.on('error', (err) => this.handleOnError(err));
            this.isConnected = true;
            this.deviceOnline();
        }
    }

    /**
     * Get if network connection opend.
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isConnected;
    }

    /**
     * Open network connection
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(function( resolve, reject ) {
            if ( 'UDP' == $this.options.protocol ) {
                resolve();
                return;
            }
            $this.connectReject = reject;
            $this.connection.connect({
                port : $this.options.port,
                host : $this.options.host,
            }, function() {
                $this.isConnected = true;
                $this.deviceOnline();
                resolve();
            });
        });
    }

    /**
     * close the serial port
     * @returns {Promise}
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            if ( 'TCP' == $this.options.protocol ) {
                $this.connection.destroy();
                resolve();
            } else if ( 'UDP' == $this.options.protocol ) {
                $this.connection.close(() => resolve());
            }
        });
    }

    /**
     * write data to network
     * @param {*} data 
     * @returns {Promise}
     */
    write( data ) {
        let $this = this;
        return new Promise(( resolve ) => {
            $this.log('send',data);
            if ( 'TCP' == $this.options.protocol ) {
                $this.connection.write(data, function() {
                    $this.dataSendSize += data.length;
                    resolve();
                });
            } else if ( 'UDP' == $this.options.protocol ) {
                $this.connection.send(data, 0, data.length, $this.options.port, $this.options.host, function( err ) {
                    $this.dataSendSize += data.length;
                    resolve();
                }); 
            }
        });
    }

    /**
     * error handler
     * @param {Error} err 
     */
    handleOnError( err ) {
        // Failed to connect to target
        if ( !this.isConnected && null != this.connectReject ) {
            this.connectReject(err);
            return;
        }

        if ( "ECONNRESET" === err.code ) {
            return;
        }
        throw err;
    }

    /**
     * handle event on network connection has data come in
     * @param {*} data 
     */
    handleOnData(data) {
        this.log('receive', data);
        this.dataReceived(data);
    }

    /**
     * handle event on close
     * @param {*} err 
     */
    handleOnClose( err ) {
        if ( false === this.isConnected ) {
            return;
        }
        if ( true === err ) {
            this.toast('disconnected', [this.title], 'warning');
        }
        this.log('close');
        this.deviceOffline();
        this.isConnected = false;
        delete Communicator.instances[this.comkey];
    }
}