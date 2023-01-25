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
        registerEventHandler(eventName, callback) {
            this.eventHandlers[eventName] = callback;
            this.$eventBus.$on(eventName, callback);
        },

        /**
         * unregister event handelr
         * @param {*} eventName 
         */
        unregisterEventHandler(eventName) {
            this.$eventBus.$off(eventName, this.eventHandlers[eventName]);
            delete this.eventHandlers[eventName];
        },

        /**
         * unregister all event handlers
         */
        unregisterAllEventHandlers() {
            for ( let eventName in this.eventHandlers ) {
                this.unregisterEventHandler(eventName);
            }
        },

        /**
         * show error message that environment does not support given action.
         * @param {String} actionName
         */
        environmentNotSupport( actionName ) {
            this.$error({
                title: this.$t('app.environmentNotSupportAction', [actionName]),
            });
        }
    }
}