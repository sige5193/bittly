<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <div :style="sizeStyle" class="indicator">
        <img :style="sizeStyle" src="./images/fi_box.svg">
        <img :style="sizeStyle" src="./images/heading_yaw.svg">
        <img ref="indicator" :style="sizeStyle" src="./images/fi_needle.svg">
        <span class="value" :style="valueStyle">{{angle}}°</span>
      </div>
    </a-tooltip>
  </div>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js'
export default {
    name : 'WidgetAngleIndicator',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : 0,
            angle : 0,
            sizeStyle : {
                width:`${this.widget.sizeWidth}px`,
                height:`${this.widget.sizeHeight}px`
            },
            valueStyle : {
                fontSize : `${Math.max(this.widget.sizeWidth, this.widget.sizeHeight)/10}px`
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
            this.angle = this.value * 1;
            this.$refs.indicator.style.transform = `rotate(${90+this.angle}deg)`;
        }
    },
}
</script>
<style scoped>
.indicator {position: relative;}
.indicator img {position:absolute;left:0;top:0;}
.indicator .value {position: absolute;width: 100%;left: 0;text-align: center;bottom: 25%;color: white;}
</style>