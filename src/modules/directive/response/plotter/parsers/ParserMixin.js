import ParserSettingEditor from './ParserSettingEditor.vue'
export default {
    components : {
        'parser-setting-editor' : ParserSettingEditor
    },
    props : {
        /**
         * parser options
         * @property {Object}
         */
        value : {},
        /**
         * instance of directive model
         * @property {MdbDirective}
         */
        directive : {},
        /**
         * @property {Function}
         */
        channelDataPush : {type:Function}
    },
    data() {
        return {
            /**
             * name list of channels
             * @property {Array<String>}
             */
            channelNames : null,
        };
    },
    mounted() {
        this.setup();
    },
    methods : {
        /**
         * generate channel label by given index
         * @public
         * @overide
         * @returns {String}
         */
        getChannelLabel(index) {
            if ( null === this.channelNames ) {
                return `CH ${index}`;
            } else {
                return this.channelNames[index];
            }
        },

        /**
         * setup current data parser.
         * @abstract
         * @protected
         */
        setup() {
            return ;
        },
        
        /**
         * get updated options to update directive model
         * @abstract
         * @protected
         */
        getUpdatedOptions() {
            throw Error('getUpdatedOptions() does not implemented');
        },

        /**
         * update view
         * @protected
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
        
        /**
         * done setting and update the v-model
         * @private
         */
        settingOk() {
            this.channelNames = null;

            let value = this.getUpdatedOptions();
            this.$emit('input', value);
            this.$emit('option-update');
        },
    },
};