<template>
  <div>
    <div :style="sizeStyle" class="indicator">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/heading_yaw.svg">
      <img :style="sizeStyle" style="transform: rotate(125deg);" src="./images/fi_needle.svg">
      <span class="value" :style="valueStyle">128°</span>
    </div>
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :resizable="true"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    ></modal-viewer-widget-setting>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'EditWidgetTerminal',
    mixins : [WidgetMixin],
    computed: {
        sizeStyle() {
            return {
                width:`${this.widget.sizeWidth}px`,
                height:`${this.widget.sizeHeight}px`
            };
        },
        valueStyle() {
            let length = Math.max(this.widget.sizeWidth, this.widget.sizeHeight);
            return {
                fontSize : `${length/10}px`
            };
        }
    },
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeHeight = 300;
            this.widget.sizeWidth = 300;
        },
    },
    /**
     * get widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'angle-indicator', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.angleIndicator.widgetName'),
            image: require('./logo.jpg'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.indicator {position: relative;}
.indicator img {position:absolute;left:0;top:0;}
.indicator .value {position: absolute;width: 100%;left: 0;text-align: center;bottom: 25%;color: white;}
</style>