export default {
    /**
     * @property {Object}
     */
    props : {
        /**
         * instance of mock module
         * @property {MdbMock}
         */
        value : {type:Object},
    },
    /**
     * @returns {Object}
     */
    data() {
        return {
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
            /**
             * instance of mock service
             * @property {Mocker}
             */
            service : null,
            /**
             * list of event handlers for mock service
             * @property {Object<String:Function>}
             */
            serviceEventHandlers : {},
        };
    },
    /**
     * 
     */
    created() {
        this.mock = this.value;
        if ( undefined != this.$store.getters.mocks[this.mock.id] ) {
            this.service = this.$store.getters.mocks[this.mock.id];
        }
    },
    /**
     * 
     */
    methods : {
        /**
         * turn on event handler by given event name and handler
         * @param {*} eventName 
         * @param {*} callback 
         */
        serviceEventOn(eventName, callback) {
            this.service.on(eventName, callback);
            this.serviceEventHandlers[eventName] = callback;
        },
        
        /**
         * turn off all event handlers for event service
         */
        serviceEventOffAll() {
            for ( let eventName in this.serviceEventHandlers ) {
                let callback = this.serviceEventHandlers[eventName];
                this.service.off(eventName, callback);
            }
        },

        /**
         * get operation menu items
         * @example 
         * ```
         * [
         *   {icon:'copy',key:'Copy',label:'Copy'},
         * ]
         * ```
         * @returns {Array<Object>}
         */
        getExtenActions() {
            return [];
        },

        /**
         * execute exten action by given key
         * @public
         */
        executeExtenAction( key ) {
            let handler = `executeExtenAction${key}`;
            if ( 'function' !== typeof(this[handler]) ) {
                throw Error(`function "mocker.${handler}()" does not exists !`);
            }
            this[handler]();
        },

        /**
         * enable mocker setting
         * @public
         */
        setting() {
            this.$refs.setting.open();
        },

        /**
         * get mocker instance
         * @returns {Mocker}
         */
        getMocker() {
            return this.mocker;
        },

        /**
         * start mocker, 
         * this function would be called by parent component
         * @public
         */
        async start() {
            throw Error('this mock has no start handler');
        },

        /**
         * stop mocker, 
         * this function would be called by parent component
         * @public
         */
        async stop() {
            throw Error('this mock has no stop handler');
        },
    },
}