export default class NetHandlerUDP {
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
        return new Promise((resolve, reject) => {
            $this.connection = window.dgram.createSocket('udp4');
            $this.connection.on('close',() => $this.handleOnClose());
            $this.connection.on('message', data => $this.handleOnData(data));
            $this.connection.on('error', err => $this.handleOnError(err));
            $this.connection.bind(() => $this.handleOnListening(resolve, reject));
        });
    }

    /**
     * callback handler for 'listening' event 
     * @param {Function} resolve
     * @param {Function} reject
     */
    handleOnListening(resolve, reject) {
        try {
            if ( 'unicast' === this.com.options.netUdpMode ) {
                // nothing todo here
            } else if ('multicast' === this.com.options.netUdpMode ) {
                this.connection.setMulticastTTL(128);
                this.connection.addMembership(this.com.options.host);
            } else if ( 'broadcast' === $this.com.options.netUdpMode ) {
                this.connection.setBroadcast(true);
            } else {
                throw Error(`udp mode "${this.com.options.netUdpMode}" is not supported`);
            }
        } catch ( e ) {
            reject(Error(this.com.$t('udpOpenFailed', [e.message])));
            return ;
        }

        this.isOpen = true;
        this.com.log(`open : ${this.com.options.netUdpMode}`);
        resolve();
    }

    /**
     * close the connection
     * @returns {Promise<void>}
     */
    close () {
        let $this = this;
        return new Promise(resolve => {
            $this.connection.close(() => {
                $this.com.log('close');
                resolve()
            });
        });
    }

    /**
     * write data to connection
     * @param {Buffer} data 
     * @returns {Promise<void>}
     */
    write( data ) {
        let $this = this;
        return new Promise((resolve, reject) => {
            let port = $this.com.options.port;
            let host = $this.com.options.host;
            $this.connection.send(data,0,data.length,port,host, err => {
                $this.com.log('write', data);
                null === err ? resolve() : reject(err);
            });
        }); 
    }

    /**
     * callback handler on connection closed.
     * @callback
     */
    handleOnClose() {
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
        let message = `UDP ERROR : ${err.message}`;
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