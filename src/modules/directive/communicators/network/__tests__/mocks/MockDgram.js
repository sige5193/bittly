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
                constructor () {
                    this.eventHandlers = {};
                }
                on( event, handler ) {
                    this.eventHandlers[event] = handler;
                }
                send(data, x, dataLength, port, host, callback ) {
                    callback();
                    let $this = this;
                    setTimeout(() => {
                        $this.eventHandlers.message(data);
                    }, 100);
                }
                

                write( data, callback ) {
                    let $this = this;
                    setTimeout(() => {
                        $this.eventHandlers.data(data);
                    }, 100);
                    callback();
                }
                end() {
                    let $this = this;
                    setTimeout(function() {
                        $this.isOpen = false;
                        $this.eventHandlers.close();
                    }, 200);
                }
                close(callback) { mock.close(this,callback); }
            };
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.close = this.mockClose();
    }

    /**
     * @returns {Object}
     */
    mockClose() {
        return jest.fn(($this,callback) => {
            callback();
            setTimeout(() => {
                $this.eventHandlers.close();
            }, 200);
        });
    }
}