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
            on(event,handler) {mock.on(this,event,handler)}
            once(event,handler) {mock.once(this,event,handler)}
            off(event,handler) {mock.off(this,event,handler)}
            connect(options,callback) {mock.connect(this,options,callback)}
            write(data,callback) {mock.write(this,data,callback)}
            destroy() {mock.destroy(this)}
        };

        return mock;
    }

    /**
     * @constructor
     */
    constructor () {
        this.connect = jest.fn((... args) => this.mockConnect(... args));
        this.destroy = jest.fn($this => this.mockDestroy($this));
        this.on = jest.fn((... args) => this.mockOn(... args));
        this.once = jest.fn((... args) => this.mockOnce(... args));
        this.off = jest.fn((... args) => this.mockOff(... args));
        this.write = jest.fn((... args) => this.mockWrite(...args));
    }

    /**
     * @param {*} event 
     * @param  {...any} data 
     * @returns 
     */
    trigger($this, event, ... data) {
        debugger
        if ( !$this.eventHandlers[event] ) {
            return ;
        }
        let handlers = $this.eventHandlers[event];
        for ( let i=0; i<handlers.length; i++ ) {
            let handler = handlers[i];
            handler.callback(... data);
        }
        $this.eventHandlers[event] = $this.eventHandlers[event].filter(handelr => !handelr.once);
    }

    /**
     * @param {*} $this 
     * @param {*} data 
     * @param {*} callback 
     */
    mockWrite($this,data,callback) {
        let mock = this;
        setTimeout(() => {
            mock.trigger($this,'data', data)
        }, 100);
        callback();
    }

    /**
     * @param {*} $this 
     * @param {*} event 
     * @param {*} callback 
     * @returns 
     */
    mockOff( $this, event, callback ) {
        if ( !$this.eventHandlers[event] ) {
            return ;
        }
        let handlers = $this.eventHandlers[event];
        $this.eventHandlers[event] = handlers.filter(handelr => handelr.callback !== callback);
    }

    /**
     * @param {*} $this 
     * @param {*} event 
     * @param {*} handler 
     */
    mockOn($this, event, handler) {
        if ( !$this.eventHandlers[event] ) {
            $this.eventHandlers[event] = [];
        }
        $this.eventHandlers[event].push({callback:handler,once:false});
    }

    /**
     * @param {*} $this 
     * @param {*} event 
     * @param {*} handler 
     */
    mockOnce($this, event, handler) {
        if ( !$this.eventHandlers[event] ) {
            $this.eventHandlers[event] = [];
        }
        $this.eventHandlers[event].push({callback:handler,once:true});
    }

    /**
     * @param {*} $this 
     * @param {*} options 
     * @param {*} callback 
     */
    mockConnect($this,options,callback) {
        callback();
    }

    /**
     * @returns {Object}
     */
    mockDestroy($this) {
        let mock = this;
        setTimeout(() => {
            mock.trigger($this,'close');
        }, 100);
    }
}