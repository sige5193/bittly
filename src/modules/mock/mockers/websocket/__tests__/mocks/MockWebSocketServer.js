export default class MockWebSocketServer {
    /**
     * @returns {MockWebSocketServer}
     */
    static setup() {
        let mock = new MockWebSocketServer();
        if ( undefined === window.ws ) {
            window.ws = {};
        }
        window.ws.WebSocketServer = class {
            constructor() {
                setTimeout(() => {
                    mock.trigger('listening');
                }, 100);
            }
            on (eventName, callback) { mock.on(eventName, callback) }
            once (eventName, callback) {mock.once(eventName, callback)}
            off(eventName, callback) {mock.off(eventName, callback)}
            close(callback) { mock.close(callback) } 
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.eventHandlers = {};
        this.eventOnceHandlers = {};
        this.on = jest.fn((eventName, callback) => this.mockOn(eventName, callback));
        this.once = jest.fn((eventName, callback) => this.mockOnce(eventName, callback));
        this.close = jest.fn((callback) => this.mockClose(callback));
        this.off = jest.fn((eventName, callback) => this.mockOff(eventName, callback));
        this.clientOn = jest.fn(($this,eventName, callback) => this.mockClientOn($this,eventName, callback));
        this.clientTerminate = jest.fn($this => this.mockClientTerminate($this));
    }

    /**
     * @param {*} eventName 
     * @param {*} params 
     */
    trigger( eventName, params = [] ) {
        if ( undefined != this.eventHandlers[eventName] ) {
            this.eventHandlers[eventName](... params);
        }
        if ( undefined != this.eventOnceHandlers[eventName] ) {
            this.eventOnceHandlers[eventName](... params);
            delete this.eventOnceHandlers[eventName];
        }
    }

    /**
     * @returns {Object}
     */
    newClient(client) {
        let mock = this;
        let ws = new (class {
            constructor() {
                this.eventHandlers = {};
                this._socket = {};
                this._socket.remoteAddress = client.address;
                this._socket.remotePort = client.port;
            }
            on(eventName, callback) { mock.clientOn(this,eventName, callback) }
            terminate() { mock.clientTerminate(this) }
        });
        this.trigger('connection',[ws]);
        return ws;
    }

    /**
     * @param {*} callback 
     */
    mockClose( callback ) {
        callback();
    }

    /**
     * @param {*} eventName 
     * @param {*} callback 
     */
    mockOn(eventName, callback) {
        this.eventHandlers[eventName] = callback;
    }

    /**
     * @param {*} eventName 
     * @param {*} callback 
     */
    mockOnce(eventName, callback) {
        this.eventOnceHandlers[eventName] = callback;
    }

    /**
     * @param {*} eventName 
     * @param {*} callback 
     */
    mockOff(eventName, callback) {
        if ( undefined != this.eventHandlers[eventName] ) {
            delete this.eventHandlers[eventName](... params);
        }
        if ( undefined != this.eventOnceHandlers[eventName] ) {
            delete this.eventOnceHandlers[eventName];
        }
    }

    /**
     * @param {*} $this 
     * @param {*} eventName 
     * @param {*} callback 
     */
    mockClientOn($this,eventName, callback) {
        $this.eventHandlers[eventName] = callback;
    }

    /**
     * @param {*} $this 
     */
    mockClientTerminate($this) {
        // nothing here
    }
}