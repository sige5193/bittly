import StatusManager from '../../status/StatusManager.js';
import WsClientConnection from './WsClientConnection';
import MockServiceBase from '../MockServiceBase.js';
export default class WsServer extends MockServiceBase {
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
         * instance of http server
         * @property {Object}
         */
        this.httpsServer = null;
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
     * @throws {Error} listen EADDRINUSE: address already in use
     * @returns {Promise<void>}
     */
    async start() {
        let options = {};
        options.path = '/' + this.options.path;
        if ( 'wss' === this.options.protocol ) {
            options.server = await this.setupHttpsServer();
        } else {
            options.host = this.options.host;
            options.port = this.options.port;
        }
        this.server = await this.startServerInstance(options);
        this.server.on('connection', ws => this.handleOnConnection(ws));
        this.server.on('error', error => this.handleOnError(error));
        this.serviceOnline();
        this.log(`start ${this.options.protocol}://${this.options.host}:${this.options.port}/${this.options.path}`);
    }

    /**
     * start server instance
     * @param {Object} options
     * @returns {Promise<WebSocketServer>}
     */
    startServerInstance(options) {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            let server = new window.ws.WebSocketServer(options);
            if ( 'ws' === $this.options.protocol ) {
                let errorHandler = error => reject(error);
                server.once('error',errorHandler);
                server.once('listening', () => {
                    server.off('error',errorHandler);
                    resolve(server);
                });
            } else {
                resolve(server);
            }
        });
    }

    /**
     * stop mock service
     * @returns {Promise<void>}
     */
    stop() {
        let $this = this;
        return new Promise(resolve => {
            for ( let key in this.clients ) {
                $this.clients[key].close();
            }
            $this.server.close(() => {
                if ( null !== $this.httpsServer ) {
                    $this.httpsServer.close();
                    $this.httpsServer = null;
                }
                $this.serviceOffline();
                this.log('stopped');
                resolve();
            });
        });
    }

    /**
     * event handelr on websocket server error
     * @private
     * @param {Error} error 
     */
    handleOnError(error) {
        throw Error(error);
    }

    /**
     * event handler on new client connected.
     * @private
     * @param {*} socket 
     */
    handleOnConnection(socket) {
        let client = new WsClientConnection(this, socket);
        this.clients[client.key] = client;
        this.eventManager.trigger('client-new', client);
    }

    /**
     * setup https server
     * @returns <Promise>
     */
    setupHttpsServer() {
        let $this = this;
        return new Promise(( resolve ) => {
            let credentials = {};
            credentials.key = $this.options.sslKey;
            credentials.cert = $this.options.sslCert;
            $this.httpsServer = window.https.createServer(credentials);
            $this.httpsServer.listen({port:$this.options.port}, () => {
                resolve($this.httpsServer);
            });
        });
    }
}