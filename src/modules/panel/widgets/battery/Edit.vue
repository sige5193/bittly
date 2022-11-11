<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" width="100" height="40">
      <rect width="80" height="30" x="5" y="8" rx="5" ry="5" fill="none" stroke-width="5" stroke="#000000"></rect>
      <rect width="10" height="10" x="83" y="17" rx="10" ry="10"></rect>
      <rect width="34.5" height="20" x="10" y="13"></rect>
    </svg>
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    >
      <a-form-item :label="$t('panel.widgets.battery.valueMin')">
        <a-input ref="inputMinValue" v-model="widget.minValue" @input="actionForceUpdate"/>
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.battery.valueMax')">
        <a-input ref="inputMaxValue" v-model="widget.maxValue" @input="actionForceUpdate"/>
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'EditWidgetBattery',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.minValue = 0;
            this.widget.maxValue = 100;
        },
    },

    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name:'battery', 
            type:'viewer',
            label:window.app.$t('panel.widgets.battery.widgetName'),
            image:require('./logo.png')
        };
    },
}
</script>