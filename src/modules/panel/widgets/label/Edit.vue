<template>
  <div>
    <span>{{widget.text}}</span>
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
    >
      <!-- text content -->
      <a-form-item :label="$t('panel.widgets.label.content')">
        <a-input ref="inputLabel" v-model="widget.text" @input="actionForceUpdate"/>
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetSlider',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.text = this.$t('panel.widgets.label.widgetName');
        },
    },

    /**
     * widget
     */
    widgetInfo () {
        return {
            name:'label', 
            type:'label',
            label : window.app.$t('panel.widgets.label.widgetName'), 
            image:require('./logo.png')
        };
    },
}
</script>