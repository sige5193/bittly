<template>
  <div>
    <!-- heading -->
    <div v-if="'heading' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/heading_yaw.svg" style="transform: rotate(-10deg);">
      <img :style="sizeStyle" src="./images/heading_mechanics.svg">
    </div>
    
    <!-- turn -->
    <div v-if="'turn' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/turn_coordinator.svg">
      <img :style="sizeStyle" src="./images/fi_tc_airplane.svg">
    </div>

    <!-- horizon -->
    <div v-if="'horizon' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/horizon_back.svg">
      <img :style="sizeStyle" src="./images/horizon_ball.svg">
      <img :style="sizeStyle" src="./images/horizon_circle.svg">
      <img :style="sizeStyle" src="./images/horizon_mechanics.svg">
      <img :style="sizeStyle" src="./images/fi_circle.svg">
    </div>

    <!-- options -->
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :resizable="true"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    >
      <!-- type -->
      <a-form-item :label="$t('panel.widgets.offsetAngleIndicator.type')">
        <a-radio-group ref="radioGroupType" v-model="widget.type" @change="actionForceUpdate">
          <a-radio-button value="heading">Heading</a-radio-button>
          <a-radio-button value="turn">Turn</a-radio-button>
          <a-radio-button value="horizon">Horizon</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetOffsetAngleIndicator',
    mixins : [WidgetMixin],
    computed: {
        sizeStyle() {
            return {
                width:`${this.widget.sizeWidth}px`,
                height:`${this.widget.sizeHeight}px`
            };
        },
    },
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.type = 'heading';
            this.widget.sizeHeight = 200;
            this.widget.sizeWidth = 200;
        },
    },

    /**
     * get widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'offset-angle-indicator', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.offsetAngleIndicator.widgetName'),
            image: require('./logo.jpg'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.indicator {position: relative;}
.indicator img {position:absolute;left:0;top:0;}
</style>