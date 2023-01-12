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
            this.enable = true;
        },

        /**
         * event handler on done setting
         */
        async actionOk() {
            let isSuccess = await this.mock.save();
            if ( !isSuccess ) {
                throw Error('Failed to save mock model');
            }
            this.$emit('change');
            this.enable = false;
        },
    },
}