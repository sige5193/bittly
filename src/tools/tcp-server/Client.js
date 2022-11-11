export default class Client {
    constructor(socket) {
        this.socket = socket;
        this.key = `${socket.remoteAddress}:${socket.remotePort}`;
        this.hasNewData = false;
        this.dataSizeSend = 0;
        this.dataSizeReceive = 0;
        this.isConnected = true;
        this.callbacks = {};

        this.socket.on('close', () => this.handleOnClose());
        this.socket.on('error', (err) => this.handleOnError(err));
    }
    
    on( eventName, callback ) {
        this.callbacks[eventName] = callback;
    }

    handleOnError(err) {
        console.log(err);
        this.isConnected = false;
        if ( undefined != this.callbacks.update ) {
            this.callbacks.update();
        }
    }

    handleOnClose() {
        console.log('close');
        this.isConnected = false;
        if ( undefined != this.callbacks.update ) {
            this.callbacks.update();
        }
    }

    close() {
        if ( !this.isConnected ) {
            return;
        }
        this.socket.destroy();
    }
}