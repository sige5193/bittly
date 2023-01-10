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
         * name of mock type
         * @property {String}
         */
        this.type = 'tcp';
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
        this.server = window.net.createServer(socket => this.tcpServerHandleNewClient(socket));
        this.server.on('error', (err) => this.$message.error(err.message));
        await this.tcpServerOpen();
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            for ( let key in this.clients ) {
                this.clients[key].close();
            }
            $this.server.close(() => resolve());
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
            try {
                $this.server.listen({port:port,host:host,}, () => resolve());
            } catch ( e ) {
                reject(e);
            }
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
}