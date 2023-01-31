export default class MockNetSocket {
    /**
     * @returns {MockNetSocket}
     */
    static setup() {
        let mock = new MockNetSocket();
        window.net = {};
        window.net.Socket = class {
            constructor () {
                this.eventHandlers = {};
            }
            on( event, handler ) {
                this.eventHandlers[event] = handler;
            }
            connect(options, callback) {
                callback();
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
            destroy() { mock.destroy(this); }
        };

        return mock;
    }

    /**
     * @constructor
     */
    constructor () {
        this.destroy = this.mockDestroy();
    }

    /**
     * @returns {Object}
     */
    mockDestroy() {
        return jest.fn($this => {
            setTimeout(() => {
                $this.eventHandlers.close();
            }, 100);
        });
    }
}