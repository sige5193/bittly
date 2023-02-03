export default class MockDgram {
    /**
     * @returns {MockDgram}
     */
    static setup() {
        let mock = new MockDgram();
        /** overide network class */
        window.dgram = {};
        window.dgram.createSocket = function() {
            return new class {
                
                send(data, x, dataLength, port, host, callback ) {
                    callback();
                    let $this = this;
                    setTimeout(() => {
                        mock.trigger('message',[data]);
                    }, 100);
                }
                

                write( data, callback ) {
                    let $this = this;
                    setTimeout(() => {
                        mock.trigger('data',[data]);
                    }, 100);
                    callback();
                }
                end() {
                    let $this = this;
                    setTimeout(function() {
                        $this.isOpen = false;
                        mock.trigger('close');
                    }, 200);
                }
                on(event,callback) {mock.on(event,callback);}
                once(event,callback) {mock.once(event,callback);}
                close(callback) { mock.close(callback); }
                bind(port,host){mock.bind(port,host);}
                off(event,callback){mock.off(event,callback);}
            };
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.eventHandlers = {};
        this.close = jest.fn((callback) => this.mockClose(callback));
        this.once = jest.fn((event,callback) => this.mockOnce(event,callback));
        this.on = jest.fn((event,callback) => this.mockOn(event,callback));
        this.off = jest.fn((event,callback) => this.mockOff(event,callback));
        this.bind = jest.fn((port,host)=>this.mockBind(port,host));
    }

    /**
     * @param {*} event 
     * @param {*} params 
     */
    trigger( event, params=[]) {
        this.eventHandlers[event].callback(... params);
        if (this.eventHandlers[event].once) {
            delete this.eventHandlers[event];
        }
    }

    /**
     * @param {*} event 
     * @param {*} callback 
     */
    mockOff(event,callback) {
        delete this.eventHandlers[event];
    }

    /**
     * @param {*} event 
     * @param {*} callback 
     */
    mockOn(event,callback) {
        this.eventHandlers[event] = {callback,once:false};
    }

    /**
     * @param {*} event 
     * @param {*} callback 
     */
    mockOnce(event,callback) {
        this.eventHandlers[event] = {callback,once:true};
    }

    /**
     * @param {*} $this 
     * @param {*} event 
     * @param {*} callback 
     */
    mockBind(port,host) {
        this.trigger('listening');
    }

    /**
     * @returns {Object}
     */
    mockClose(callback) {
        callback();
        setTimeout(() => this.trigger('close'), 200);
    }
}