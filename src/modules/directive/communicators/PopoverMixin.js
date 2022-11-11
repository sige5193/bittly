import Formatter from '@/utils/Formatter.js'
/**
 * communicator popover mixin
 * popover use to show basic information about connection in footer 
 * toolbar.
 * @author sige
 */
export default {
    /**
     * @var {Object}
     */
    props : {
        /**
         * @var {Communicator}
         */
        device : Object,
    },
    filters : {
        /**
         * format value as filesize
         * @param {Number} value 
         * @returns {String}
         */
        filesize ( value ) {
            return Formatter.asFileSize(value);
        },
    },
    methods : {
        /**
         * Refresh compoment
         */
        actionRefresh() {
            this.$forceUpdate();
        }
    },
}