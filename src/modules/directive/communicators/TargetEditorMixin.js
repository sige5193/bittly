import Common from '@/utils/Common.js'
/**
 * target edit mixin
 * @author sige
 */
export default {
    props : {
        /**
         * @var {Object} target object
         */
        value : Object,
    },
    data() {
        return {
            /**
             * editting target model
             * @var {Object}
             */
            target : null,
            /**
             * if editor has inited
             * @var {boolean}
             */
            isEditorInited : false,
            /**
             * indicate whether disconnection is required.
             * @property {Boolean}
             */
            isDisconnectRequired : false,
        };
    },
    watch : {
        value () {
            this.initVModel();
        },
    },
    created() {
        this.initVModel();
    },
    methods : {
        /**
         * init v-model
         */
        initVModel() {
            this.target = Common.objCopy(this.value);
        },
        
        /**
         * update v-model
         */
        async updateVModel() {
            if ( this.isEditorInited && this.isDisconnectRequired ) {
                this.isDisconnectRequired = false;
                // offline the device before update target model.
                let comkey = this.getComKeyByOptions(this.value);
                let com = this.$store.getters.communicators[comkey];
                if ( undefined != com ) {
                    await com.close();
                }
            }
            
            this.$emit('input', Common.objCopy(this.target));
            this.$emit('change');
        },
        
        /**
         * get communicator key by options use to close device after options change.
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return null;
        },

        /**
         * update vmode and trigger change event
         * @param {Boolean} disconnect indicate whether disconnect the connection.
         */
        actionUpdateTarget( disconnect ) {
            this.$forceUpdate();
            if ( undefined != disconnect && true === disconnect ) {
                this.isDisconnectRequired = true;
            }
            this.updateVModel();
        },

        /**
         * force update componment
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
        
        /**
         * set enable/disable parameter editor
         * @param {Boolean} enable 
         */
        parameterEditorEnable( enable ) {
            this.$emit('parameter-editor-enable-change', enable);
        }
    },
}