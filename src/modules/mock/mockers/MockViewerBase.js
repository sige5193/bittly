export default {
    /**
     * 
     */
    methods : {
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
    },
}