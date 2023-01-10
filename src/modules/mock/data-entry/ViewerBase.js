import Common from "../../../utils/Common.js";
export default {
    props : {
        /**
         * instance of data entry
         * @property {Object}
         */
        entry : {},
        /**
         * name of viewer mode
         * @property {String}
         */
        mode : {},
    },
    computed : {
        /**
         * get viewer content
         * @returns {String}
         */
        viewerContent() {
            return 'text' === this.mode 
            ? this.formatAsText(this.entry.data)
            : this.formatAsHex(this.entry.data);
        }
    },
    methods : {
        /**
         * format buffer as text
         * @param {*} data 
         */
        formatAsText( data ) {
            return data.toString();
        },
        /**
         * format buffer as hex string
         * @returns {String}
         */
        formatAsHex( data ) {
            return Common.convertBufferToHexString(data);
        },
    }
}