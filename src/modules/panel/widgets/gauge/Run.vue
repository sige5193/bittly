<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <div ref="chart"></div>
  </a-tooltip>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
import * as echarts from 'echarts';
export default {
    name : 'WidgetGauge',
    mixins : [WidgetViewerMixin],
    data() {
        return {
            value : 0,
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
         * value map
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
            this.$forceUpdate();
            
            let $this = this;
            this.$nextTick(() => {
                $this.refreshChart();
            });
        },

        /**
         * refresh chart
         */
        refreshChart() {
            if ( null == this.chart ) {
                this.chart = echarts.init(this.$refs.chart, null, {
                    width: this.widget.sizeWidth * 1,
                    height: this.widget.sizeHeight * 1,
                });
            }

            this.chart.setOption({
                series: [{
                    type: 'gauge',
                    radius: "100%",
                    min : this.widget.minValue * 1,
                    max : this.widget.maxValue * 1,
                    splitNumber : this.widget.splitNumber * 1,
                    progress: {
                        show: true
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}'
                    },
                    data: [{ value: this.value }]
                }]
            });
        },
    },
}
</script>