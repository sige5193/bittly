<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <vue-thermometer
      :value="temperature"
      :min="widget.minValue*1"
      :max="widget.maxValue*1"
      :options="options"
    />
  </a-tooltip>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetThermometer',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : 0,
            temperature : this.widget.minValue * 1,
            options : {
                text: {
                    color: 'black',
                    fontSize: 10,
                    textAdjustmentY: 1,
                    fontFamily: 'Arial',
                    textEnabled: true
                },
                thermo: {
                    color: '#FF0000',
                    backgroundColor: '#fcf9f9',
                    frameColor: 'black',
                    ticks: this.widget.tickCount * 1,
                    ticksEnabled: true,
                    tickColor: 'black',
                    tickWidth: '1'
                },
                layout: {
                    height: this.widget.sizeHeight * 1,
                    width: this.widget.sizeWidth * 1
                }
            }
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
         * update view
         * @override
         */
        updateWidget() {
            this.temperature = this.value * 1;
        }
    },
}
</script>