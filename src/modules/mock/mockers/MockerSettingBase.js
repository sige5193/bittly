export default {
    props : {
        /**
         * mock instance to edit
         * @property {Object}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * indicate if setting enabled.
             * @property {Boolean}
             */
            enable : false,
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
        };
    },
    methods : {
        /**
         * open setting modal
         * @public
         */
        open() {
            this.mock = this.value;
            if ( !this.mock.options.isInited ) {
                this.initOptions(this.mock.options);
                this.mock.options.isInited = true;
            }
            this.enable = true;
        },

        /**
         * init mock options
         * @param {*} options 
         */
        initOptions( options ) {
            // nothing to do here
        },

        /**
         * event handler on done setting
         */
        async actionOk() {
            let typeName = this.$t(`mock.mockers.${this.mock.type}.typeName`);
            let summary = this.generateSummary(this.mock.options);
            this.mock.summary = '';
            if ( 0 < summary.length ) {
                this.mock.summary = `${typeName} ${summary}`;
            }
            
            let isSuccess = await this.mock.save();
            if ( !isSuccess ) {
                throw Error('Failed to save mock model');
            }
            this.$emit('change');
            this.enable = false;
            this.mock = null;
        },

        /**
         * generate summary by options
         * @param {Object} options 
         * @returns 
         */
        generateSummary( options ) {
            return '';
        },

        /**
         * force update this component
         */
        forceUpdate() {
            this.$forceUpdate()
        }
    },
}