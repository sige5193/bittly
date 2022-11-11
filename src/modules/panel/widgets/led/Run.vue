<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
     <div>
        <div v-if="'digital' == widget.mode" 
          :class="`led-light ${widget.color} ${digitalStatus}`"
        ></div>
        <div v-else class="led-light" :style="analogStatus">
          <div :class="`led-core ${widget.color}`"></div>
        </div>
     </div>
     <div class="led-base"></div>
  </a-tooltip>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'EditWidgetLed',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : null,
            digitalStatus : '',
            analogStatus : {background: `rgb(255 255 255)`},
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
            this.value *= 1;
            if ( isNaN(this.value) ) {
                this.value = 0;
            }
            if ( 'digital' == this.widget.mode ) {
                this.digitalStatus = 0 == this.value * 1 ? '' : 'on';
            } else {
                this.updateWidgetAnalogColor();
            }
        },

        /**
         * update analog color
         */
        updateWidgetAnalogColor() {
            let color = this.widget.color;
            let handelr = `updateWidgetAnalogColor` + color[0].toUpperCase() + color.substr(1);
            this[handelr]();
        },

        /**
         * update analog color : red
         */
        updateWidgetAnalogColorRed() {
            let val = 255 - this.getMappedValue();
            this.analogStatus = {
                background : `rgb(255 ${val} ${val})`,
                boxShadow : `0px -3px 20px 5px rgb(255 ${val} ${val})`,
            };
        },

        /**
         * update analog color : Blue
         */
        updateWidgetAnalogColorBlue() {
            let val = 255 - this.getMappedValue();
            this.analogStatus = {
                background : `rgb(${val} ${val} 255)`,
                boxShadow : `0px -3px 20px 5px rgb(${val} ${val} 255)`,
            };
        },

        /**
         * update analog color : Green
         */
        updateWidgetAnalogColorGreen() {
            let val = 255 - this.getMappedValue();
            this.analogStatus = {
                background : `rgb(${val} 255 ${val})`,
                boxShadow : `0px -3px 20px 5px rgb(${val} 255 ${val})`,
            };
        },

        /**
         * update analog color : Yellow
         */
        updateWidgetAnalogColorYellow() {
            let val = 255 - this.getMappedValue();
            this.analogStatus = {
                background : `rgb(255 255 ${val})`,
                boxShadow : `0px -3px 20px 5px rgb(255 255 ${val})`,
            };
        },

        /**
         * update analog color : Gray
         */
        updateWidgetAnalogColorGray() {
            let val = 255 - this.getMappedValue();
            this.analogStatus = {
                background : `rgb(${val} ${val} ${val})`,
                boxShadow : `0px -3px 20px 5px rgb(${val} ${val} ${val})`,
            };
        },

        /**
         * get mapped value
         * @return {Number}
         */
        getMappedValue() {
            let inMin = this.widget.minValue;
            let inMax = this.widget.maxValue;
            let val = this.value;
            if ( val < inMin ) {
                val = inMin;
            }
            if ( val > inMax ) {
                val = inMax;
            }
            
            let outMin = 0;
            let outMax = 255;
            return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }
    },
}
</script>
<style scoped>
.led-base {background: #b1b1b1;height: 10px;width: 24px;border-radius: 3px 3px 0 0;}

.led-core {width: 5px;height: 5px;display: inline-block;margin: 10px 8px;border-radius: 50% 50% 0 0;}
.led-core.blue {background: #8686d1;}
.led-core.gray {background: #bbbbbb;}
.led-core.green {background: #abc5ab;}
.led-core.red {background:#c39393;}
.led-core.yellow {background:#f2f23b;}

.led-light {height: 16px;width: 21px;margin: auto;border-radius: 10px 10px 0 0;}
.led-light.blue {background: #8686d1;}
.led-light.gray {background: #bbbbbb;}
.led-light.green {background: #abc5ab;}
.led-light.red {background:#c39393;}
.led-light.yellow {background:#bdbd7b;}
.led-light.blue.on {background: #5656ff !important;box-shadow: 0px -3px 20px 5px #5656ff;}
.led-light.gray.on {background: #565656 !important;box-shadow: 0px -3px 20px 5px black;}
.led-light.green.on {background: #03c303 !important;box-shadow: 0px -3px 20px 5px #00e300;}
.led-light.red.on {background: #f14040 !important;box-shadow: 0px -3px 20px 5px #f14040;}
.led-light.yellow.on {background: yellow !important;box-shadow: 0px -3px 20px 5px yellow;}
</style>