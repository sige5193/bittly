<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <!-- heading -->
    <div v-if="'heading' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img ref="indicator" :style="sizeStyle" src="./images/heading_yaw.svg" style="transform: rotate(-10deg);">
      <img :style="sizeStyle" src="./images/heading_mechanics.svg">
    </div>
    
    <!-- turn -->
    <div v-if="'turn' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/turn_coordinator.svg">
      <img ref="indicator" :style="sizeStyle" src="./images/fi_tc_airplane.svg">
    </div>

    <!-- horizon -->
    <div v-if="'horizon' == widget.type" class="indicator" :style="sizeStyle">
      <img :style="sizeStyle" src="./images/fi_box.svg">
      <img :style="sizeStyle" src="./images/horizon_back.svg">
      <img ref="indicator" :style="sizeStyle" src="./images/horizon_ball.svg">
      <img :style="sizeStyle" src="./images/horizon_circle.svg">
      <img :style="sizeStyle" src="./images/horizon_mechanics.svg">
      <img :style="sizeStyle" src="./images/fi_circle.svg">
    </div>
  </a-tooltip>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetOffsetAngleIndicator',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : null,
            sizeStyle : {
                width:`${this.widget.sizeWidth}px`,
                height:`${this.widget.sizeHeight}px`
            },
        };
    },
    methods : {
        /**
         * get attribute expression map
         * @override
         */
        getAttributeExpressionMap() {
            return [{name:'value',expr:this.widget.sourceExpression}];
        },

        /**
         * get value map
         * @override
         */
        getVariableMap() {
            let map = {};
            map[this.widget.sourceVariable] = 'value';
            return map;
        },

        /**
         * update widget
         * @override
         */
        updateWidget() {
            let angle = this.value * -1;
            if ( 'horizon' == this.widget.type ) {
                if ( 0 > angle && angle < -20 ) {
                    angle = -20;
                }
                if ( 0 < angle && angle > 20 ) {
                    angle = 20;
                }
                this.$refs.indicator.style.top = `${angle}px`
            } else {
                this.$refs.indicator.style.transform = `rotate(${angle}deg)`;
            }
        }
    },
}
</script>
<style scoped>
.indicator {position: relative;}
.indicator img {position:absolute;left:0;top:0;}
</style>