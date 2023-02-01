export default class MockSerialport {
    /**
     * @returns {MockSerialport}
     */
    static setup() {
        let mock = new MockSerialport();
        window.SerialPort = class {
            static list() { return mock.list(); }
            constructor() {
                this.isOpen = false;
            }
            on(name,callback) { mock.on(this,name,callback); }
            open(callback) { mock.open(this, callback); }
            write(data, callback) { mock.write(this,data,callback); }
            close(callback) { mock.close(this, callback) }
            drain(callback) { mock.drainCallback = callback; }
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.enableEcho = true;
        this.drainCallback = null;
        this.eventHandlers = {};
        this.list = this.mockList();
        this.open = this.mockOpen();
        this.write = this.mockWrite();
        this.close = this.mockClose();
        this.on = this.mockOn();
    }

    /**
     * @param {*} data 
     */
    response( data ) {
        this.eventHandlers.data(data);
    }

    /**
     * @returns {Object}
     */
    mockOn() {
        let mock = this;
        return jest.fn(($this,name,callback) => {
            mock.eventHandlers[name] = callback;
        });
    }

    /**
     * @returns {Object}
     */
    mockClose() {
        let mock = this;
        return jest.fn(($this,callback) => {
            mock.eventHandlers.close(null);
            callback(null);
        });
    }

    /**
     * @returns {Object}
     */
    mockWrite() {
        let mock = this;
        return jest.fn(($this,data,callback) => {
            callback();
            setTimeout(()=> mock.drainCallback(), 100);
            if ( mock.enableEcho ) {
                setTimeout(()=> mock.eventHandlers.data(data), 200);
            }
        });
    }

    /**
     * @returns {Object}
     */
    mockOpen() {
        let mock = this;
        return jest.fn(($this,callback) => {
            callback();
            setTimeout(() => {
                mock.eventHandlers.open();
                $this.isOpen = true;
            }, 100);
        });
    }

    /**
     * @returns {Object}
     */
    mockList() {
        return jest.fn(() => {
            return Promise.resolve([]);
        });
    }
}