import StatusManager from '../../status/StatusManager.js';
import UdpClientConnection from './UdpClientConnection.js';
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
    start() {
        this.server = window.dgram.createSocket('udp4');
        this.server.on('message', ( data, client ) => this.udpServerDataReceive(client, data));
        this.server.on('error', (err) => {
            $this.$message.error(err.message);
        });

        let $this = this;
        return new Promise(( resolve, reject ) => {
            try {
                $this.server.bind($this.options.port, $this.options.host);
                $this.serviceOnline();
                resolve();
            } catch ( e ) {
                reject(e);
            }
        });
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
            $this.server.close(() => {
                $this.serviceOffline();
                resolve();
            });
        });
    }

    /**
     * process data receive event
     * @param {Object} client
     * @param {Buffer} data
     */
    udpServerDataReceive(client, data) {
        let key = `${client.address}:${client.port}`;
        if ( undefined === this.clients[key] ) {
            let connection = new UdpClientConnection(this, client);
            this.clients[key] = connection;
            this.eventManager.trigger('new-client', connection);
        }
        this.clients[key].receiveData(data);
    }
}