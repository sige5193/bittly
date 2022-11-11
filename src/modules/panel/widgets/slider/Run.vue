<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <a-slider ref="slider" v-model="value" 
      :class="`panel-widget-slider slider-${widget.direction}`"
      :style="'vertical' == widget.direction ? {height:'200px'} : {width:'200px'}" 
      :min="widget.minValue*1"
      :max="widget.maxValue*1"
      :disabled="isExecuting"
      :vertical="'vertical' == widget.direction"
       @afterChange="actionExecute"
    />
  </a-tooltip>
</template>
<script>
import WidgetMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetSlider',
    mixins : [WidgetMixin],
    data() {
        return {
            value : this.widget.defaultValue*1,
        };
    },
    methods : {
        /**
         * get value of this widget
         */
        valueGet() {
            return this.value*1;
        },
    },
}
</script>
<style>
.panel-widget-slider .ant-slider-step {background: #adadad !important;border-radius: 5px !important;}
</style>
<style scoped>
.slider-horizontal {margin: 5px 6px 5px !important;}
</style>