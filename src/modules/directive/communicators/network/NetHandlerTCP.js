export default class NetHandlerTCP {
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
     * @constructor
     * @param {Communicator} com 
     */
    constructor(com) {
        /**
         * instance of communicator
         * @property {Communicator}
         */
        this.com = com;
        /**
         * indicate whether connection is opened.
         * @property {Boolean}
         */
        this.isOpen = false;
        /**
         * udp connection
         * @property {Socket}
         */
        this.connection = null;
        /**
         * indicate whether close the connection manually
         * @property {Boolean}
         */
        this.isManualClose = false;
    }

    /**
     * whether connection is opened.
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isOpen;
    }

    /**
     * setup udp connection
     * @returns {void}
     */
    open() {
        let $this = this;
        return new Promise(( resolve, reject ) => {
            let connectErrorHandler = err => reject(err);
            $this.connection = new window.net.Socket();
            $this.connection.once('error', connectErrorHandler);
            
            let port = $this.com.options.port;
            let host = $this.com.options.host;
            $this.connection.connect({port,host}, () => {
                $this.connection.off('error', connectErrorHandler);
                $this.connection.on('data', data => $this.handleOnData(data));
                $this.connection.on('error',err => $this.handleOnError(err));
                $this.connection.on('close',err => $this.handleOnClose(err));
                $this.isOpen = true;
                $this.com.log(`open`);
                resolve();
            });
        });
    }

    /**
     * close the connection
     * @returns {Promise<void>}
     */
    close () {
        let $this = this;
        return new Promise(resolve => {
            $this.isManualClose = true;
            $this.connection.destroy();
            $this.com.log('close');
            resolve();
        });
    }

    /**
     * write data to connection
     * @param {Buffer} data 
     * @returns {Promise<void>}
     */
    async write( data ) {
        this.com.log(`write(${data.length}) : ${data.slice(0, 10).toString('hex')} ...`);

        let chunkSize = 1024;
        let cursor = 0;
        while ( cursor < data.length ) {
            let chunk = data.slice(cursor, cursor + chunkSize);
            await this.writeChunk(chunk);
            cursor += chunkSize;
        }
    }

    /**
     * write chunk data
     * @param {Buffer} data 
     * @returns {Promise<void>}
     */
    writeChunk( data ) {
        let $this = this;
        return new Promise((resolve, reject) => {
            if ( !$this.connection.writable ) {
                return reject(Error($this.com.$t('tcpWriteFailed')));
            }

            let isFlushed = $this.connection.write(data);
            if ( isFlushed ) {
                return resolve();
            }
            
            if ( !$this.connection.writableNeedDrain ) {
                return reject(Error($this.com.$t('tcpWriteFailed')));
            }

            $this.connection.once('drain', async () => {
                try {
                    await $this.writeChunk(data);
                    resolve();
                } catch ( e ) {
                    reject(e);
                }
            });
        });
    }

    /**
     * callback handler on connection closed.
     * @callback
     */
    handleOnClose() {
        if ( !this.isManualClose ) {
            this.com.toast('disconnected', [this.com.title], 'warning');
        }
        this.isManualClose = false;
        this.isOpen = false;
        this.com.deviceDisconnected();
        this.com.log('disconnected');
    }

    /**
     * callback handler on connection error
     * @param {*} err 
     * @callback
     */
    handleOnError(err) {
        if ( "ECONNRESET" === err.code ) {
            return;
        }

        let message = `TCP ERROR : ${err.message}`;
        this.com.log('error', err);
        throw Error(message);
    }

    /**
     * callback handler on receive message
     * @param {*} data 
     * @callback
     */
    handleOnData(data) {
        this.com.log('receive', data);
        this.com.dataReceived(data);
    }
}