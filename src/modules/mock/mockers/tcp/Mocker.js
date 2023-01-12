import StatusManager from '../../status/StatusManager.js';
import TcpClientConnection from './TcpClientConnection.js';
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
         * @property {server}
         */
        this.server = null;
        /**
         * list of clients
         * @property {Object}
         */
        this.clients = {};
        /**
         * callback function to reject server open
         * @property {Function}
         */
        this.openRejectCallback = null;
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
        this.server = window.net.createServer(socket => this.tcpServerHandleNewClient(socket));
        this.server.on('error', (err) => this.tcpServerHandleError(err));
        this.server.on('close', () => this.tcpServerHandleClose());
        await this.tcpServerOpen();
        this.serviceOnline();
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(resolve => {
            for ( let key in this.clients ) {
                this.clients[key].close();
            }
            $this.server.close(() => {
                resolve();
            });
        });
    }

    /**
     * open serialport connection
     * @private
     * @returns {Promise<void>}
     */
    tcpServerOpen() {
        let $this = this;
        let host = this.options.host;
        let port = this.options.port;
        return new Promise(( resolve, reject ) => {
            $this.openRejectCallback = reject;
            $this.server.listen({port:port,host:host,}, () => resolve());
        });
    }

    /**
     * event handler on new client connected.
     * @param {*} socket 
     */
    tcpServerHandleNewClient(socket) {
        let client = new TcpClientConnection(this, socket);
        this.clients[client.key] = client;
        this.eventManager.trigger('new-client', client);
    }

    /**
     * event handler on server error
     * @param {*} err 
     */
    tcpServerHandleError(err) {
        if ( null !== this.openRejectCallback ) {
            this.openRejectCallback(err);
            this.openRejectCallback = null;
            return ;
        }

        this.trigger('error', err);
    }

    /**
     * event handler on server closed
     */
    tcpServerHandleClose() {
        this.serviceOffline();
    }
}