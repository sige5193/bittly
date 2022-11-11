import WidgetEditSettingViewerModal from './WidgetEditSettingViewerModal.vue'
import WidgetEditSettingActionModal from './WidgetEditSettingActionModal.vue'
import Common from '@/utils/Common.js'
export default {
    components : {
        'modal-action-widget-setting' : WidgetEditSettingActionModal,
        'modal-viewer-widget-setting' : WidgetEditSettingViewerModal,
    },
    props : {
        /**
         * widget config object
         * @property {Object}
         */
        value : {},
        /**
         * instance of MdbPanel
         * @property {MdbPanel}
         */
        panel : {},
    },
    data () {
        return {
            /**
             * edit copy of value to config widget
             * @property {Object}
             */
            widget : {},
        };
    },
    watch : {
        value () {
            this.initVModel();
        },
    },
    /**
     * init v-model on component created
     * @overide
     */
    created() {
        this.initVModel();
    },
    /**
     * methods of widget editor
     * @overide
     */
    methods : {
        /**
         * init v-model
         */
        async initVModel() {
            this.widget = Common.objCopy(this.value);
            if ( undefined == this.widget.inited || !this.widget.inited ) {
                this.initWidget();
                this.widget.inited = true;
                this.updateVModel();
            }
        },

        /**
         * update v-model
         */
        updateVModel() {
            this.$emit('input', Common.objCopy(this.widget));
        },

        /**
         * init widget if widget is new or have not inited
         * @override
         */
        initWidget() {},
        
        /**
         * callback on setting ok
         * @overide
         */
        onSettingOK () {},

        /**
         * open setting modal to config widget
         */
        async setting() {
            let hasChanged = await this.$refs.setting.open();
            if ( !hasChanged ) {
                return ;
            }
            
            this.onSettingOK();
            this.updateVModel();
            this.actionForceUpdate();
            this.$emit('panel-change');
        },

        /**
         * update v-model for event handler
         */
        actionUpdateVModel() {
            this.updateVModel();
        },

        /**
         * update widget view
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
    },
};