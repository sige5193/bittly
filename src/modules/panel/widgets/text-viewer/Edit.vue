<template>
  <div>
    <a-textarea 
      read-only
      :placeholder="$t('panel.widgets.textViewer.placeholder')"
      :style="{width:`${widget.sizeWidth}px`,height:`${widget.sizeHeight}px`}" 
    />
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :resizable="true"
    ></modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetTextViewer',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeHeight = 10;
            this.widget.sizeWidth = 300;
        },
    },
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name:'text-viewer', 
            type:'viewer',
            label: window.app.$t('panel.widgets.textViewer.widgetName'),
            image:require('./logo.png'),
            resizable : true,
        };
    },
}
</script>