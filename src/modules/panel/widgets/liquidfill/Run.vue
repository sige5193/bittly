<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <div ref="chart"></div>
  </a-tooltip>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
import * as echarts from 'echarts';
import 'echarts-liquidfill'
export default {
    name : 'WidgetGauge',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : null,
            chart : null,
        };
    },
    mounted() {
        this.refreshChart();
    },
    destroyed() {
        this.chart.dispose();
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
         * update widgets
         * @override
         */
        updateWidget() {
            this.$forceUpdate();
            
            let $this = this;
            this.$nextTick(() => {
                $this.refreshChart();
            });
        },

        /**
         * refresh charts
         */
        refreshChart() {
            let min = this.widget.minValue * 1;
            let max = this.widget.maxValue * 1;
            let val = this.value * 1;
            if ( val < min ) {
                val = min;
            }
            if ( val > max ) {
                val = max;
            }
            
            let range = max - min;
            let calval = val - min;
            let showValue = calval / range;
            if ( isNaN(showValue) ) {
                showValue = 0;
            }

            if ( null == this.chart ) {
                this.chart = echarts.init(this.$refs.chart, null, {
                    width: this.widget.sizeWidth * 1,
                    height: this.widget.sizeHeight * 1,
                });
            }

            this.chart.setOption({
                series: [{
                    type: 'liquidFill',
                    radius: '90%',
                    data: [showValue],
                    label: {
                        fontSize: 24,
                    },
                    outline: {
                        show: false
                    }
                }]
            });
        },
    },
}
</script>