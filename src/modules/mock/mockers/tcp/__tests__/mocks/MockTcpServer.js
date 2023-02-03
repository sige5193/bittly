export default class MockTcpServer {
    /**
     * @returns {MockTcpServer}
     */
    static setup() {
        let mock = new MockTcpServer();
        if ( undefined === window.net ) {
            window.net = {};
        }
        window.net.createServer = () => {
            return new (class {
                on(event,callback){mock.on(event,callback)}
                listen(options, callback) {mock.listen(options,callback)}
                close(callback) {mock.close(callback)}
            });
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.eventHandlers = {};
        this.on = jest.fn((event,callback) => this.mockOn(event,callback));
        this.listen = jest.fn((options,callback) => this.mockListen(options,callback));
        this.close = jest.fn((callback)=>this.mockClose(callback));
    }

    /**
     * @param {*} callback 
     */
    mockClose(callback) {
        this.eventHandlers.close();
        callback();
    }

    /**
     * @param {*} options 
     * @param {*} callback 
     */
    mockListen(options,callback){
        callback();
    }

    /**
     * @param {*} event 
     * @param {*} callback 
     */
    mockOn(event,callback) {
        this.eventHandlers[event] = callback;
    }
}