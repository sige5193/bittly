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
                constructor() {
                    this.eventHandlers = {};
                }
                on(event,callback){mock.on(this,event,callback);}
                once(event,callback){mock.once(this,event,callback);}
                off(event,callback){mock.off(this,event,callback);}
                bind(callback){mock.bind(this, callback);}
                close(callback){mock.close(this, callback)}
                send(data,pos,length,port,host,callback) {mock.send(this,data,pos,length,port,host,callback)}
            };
        };
        return mock;
    }

    /**
     * @constructor
     */
    constructor() {
        this.on = jest.fn((... args) => this.mockOn(... args));
        this.once = jest.fn((... args) => this.mockOnce(... args));
        this.off = jest.fn((... args) => this.mockOff(... args));
        this.bind = jest.fn((... args)=>this.mockBind(... args));
        this.close = jest.fn((... args) => this.mockClose(... args));
        this.send = jest.fn((... args) => this.mockSend(...args));
    }

    /**
     * @param {*} event 
     * @param  {...any} data 
     * @returns 
     */
    trigger($this, event, ... data) {
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
     * @param {*} event 
     * @param {*} callback 
     */
    mockBind($this,callback) {
        if ( 'function' === typeof(callback) ) {
            callback();
        }
        this.trigger($this,'listening');
    }

    /**
     * @returns {Object}
     */
    mockClose($this, callback) {
        callback();
        setTimeout(() => this.trigger($this, 'close'), 200);
    }

    /**
     * @param {*} $this 
     * @param {*} data 
     * @param {*} pos 
     * @param {*} length 
     * @param {*} port 
     * @param {*} host 
     * @param {*} callback 
     */
    mockSend($this,data,pos,length,port,host,callback) {
        let mock = this;
        callback(null);
        setTimeout(() => {
            mock.trigger($this,'message',data);
        }, 100);
    }
}