import StatusManager from '../../status/StatusManager.js';
import UdpClientConnection from './UdpClientConnection.js';
import MockServiceBase from '../MockServiceBase.js';
export default class MockService extends MockServiceBase {
    /**
     * @constructor
     * @param {MdbMock} mock 
     */
    constructor(mock) {
        super(mock);
        /**
         * instance of serialport
         * @property {server}
         */
        this.server = null;
        /**
         * list of clients
         * @property {Object}
         */
        this.clients = {};
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
        this.server = window.dgram.createSocket('udp4');
        await this.startServerInstance();
        this.server.on('message', (data,client) => this.handleOnMessage(client, data));
        this.server.on('error', err => this.handleOnError(err));
        this.serviceOnline();
        this.log('start');
    }

    /**
     * start server instance
     * @returns {Promise}
     */
    startServerInstance() {
        let $this = this;
        return new Promise((resolve, reject) => {
            let errorHandler = err => {
                $this.server.close();
                reject(err);
            };
            $this.server.once('error',errorHandler);
            $this.server.once('listening', () => {
                $this.server.off('error',errorHandler);
                resolve();
            });
            $this.server.bind($this.options.port, $this.options.host);
        });
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            $this.server.close(() => {
                $this.serviceOffline();
                $this.log('stop');
                resolve();
            });
        });
    }

    /**
     * event handler on udp error
     * @param {*} error 
     */
    handleOnError(error) {
        let message = error.message;
        throw Error(`UDP MOCK ERROR : ${message}`);
    }

    /**
     * process data receive event
     * @param {Object} client
     * @param {Buffer} data
     */
    handleOnMessage(client, data) {
        let key = `${client.address}:${client.port}`;
        if ( undefined === this.clients[key] ) {
            let connection = new UdpClientConnection(this, client);
            this.clients[key] = connection;
            this.eventManager.trigger('new-client', connection);
        }
        this.clients[key].receiveData(data);
    }
}