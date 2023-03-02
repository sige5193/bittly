export default {
    /**
     * data to current component
     * @returns {Object}
     */
    data() {
        return {
            /**
             * maps to event handlers
             * @property {Object}
             */
            eventHandlers : {},
        };
    },
    methods : {
        /**
         * register event handler
         * @param {*} eventName 
         * @param {*} callback 
         */
        registerEventHandler(eventName, callback, target='eventbus') {
            let eventkey = `${eventName}@${target}`;
            this.eventHandlers[eventkey] = {callback, target,name:eventName};
            if ( 'eventbus' === target ) {
                this.$eventBus.$on(eventName, callback);
            } else if ( 'window' === target ) {
                window.addEventListener(eventName, callback);
            }
        },

        /**
         * unregister event handelr
         * @param {*} eventName 
         */
        unregisterEventHandler(eventName, target='eventbus') {
            let eventkey = `${eventName}@${target}`;
            let callback = this.eventHandlers[eventkey].callback;
            if ( 'eventbus' === target ) {
                this.$eventBus.$off(eventName,callback);
            } else if ( 'window' === target ) {
                window.removeEventListener(eventName,callback);
            }
            delete this.eventHandlers[eventkey];
        },

        /**
         * unregister all event handlers
         */
        unregisterAllEventHandlers() {
            for ( let eventkey in this.eventHandlers ) {
                let handlers = this.eventHandlers[eventkey];
                this.unregisterEventHandler(handlers.name, handlers.target);
            }
        },

        /**
         * show error message that environment does not support given action.
         */
        environmentNotSupport( ) {
            this.$error({
                title: this.$t('app.environmentNotSupportAction'),
                okText : this.$t('button.ok'),
            });
        },

        /**
         * @param {*} title 
         * @returns {Promise<Boolean>}
         */
        confirm( title ) {
            let $this = this;
            return new Promise(resolve => {
                $this.$confirm({
                    title: title,
                    okText : this.$t('button.ok'),
                    cancelText : this.$t('button.cancel'),
                    onOk : () => resolve(true),
                    onCancel : () => resolve(false),
                });
            });
        }
    }
}