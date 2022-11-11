<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <div class="bg-white" ref="chart"></div>
  </a-tooltip>
</template>
<script>
import WidgetMixin from '../WidgetRunMixin.js' 
import * as echarts from 'echarts';
export default {
    name : 'RunWidgetChartLine',
    mixins : [WidgetMixin],
    data() {
        return {
            chart : null,
            data : [],
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
         * init widget
         */    
        initWidget() {
            let $this = this;
            this.addVariableWatcher(this.widget.watchVariable, value => {
                try {
                    $this.processNewData(value)
                } catch (e) {
                    $this.showException(e);
                }
            });
        },

        /**
         * process new data
         */
        processNewData( value ) { 
            // replace variable placeholders
            let expr = this.widget.dataExpression;
            if ( 0 == expr.length ) {
                expr = `${value}`;
            }

            expr = expr.replaceAll('{{value}}', value);
            let regex = /\{\{(?<variable>.*?)\}\}/gm;
            let match = null;
            while ((match = regex.exec(expr)) !== null) {
                let varName = match.groups.variable;
                let varValue = this.runtime.getVariableValue(varName, null);
                if ( null === varValue ) {
                    throw Error(this.$t('panel.widgets.lineChart.dataExprUnableToReadVariable',[varName]));
                }
                expr = expr.replaceAll(match[0], varValue);
            }

            // execute expression
            let exprValue = null;
            try {
                let exprFunc = Function(`return ${expr};`);
                exprValue = exprFunc.call({});
            } catch ( e ) {
                throw Error(window.app.$t('panel.widgets.lineChart.dataExprFailedToExecuteExpr', [item.expr, expr, e.message]));
            }
            
            this.data.push(exprValue);
            if ( this.data.length > this.widget.maxDataLength*1 ) {
                this.data.shift();
            }

            this.$nextTick(() => this.refreshChart());
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
                title : {text:this.widget.title,x:'center',padding:2,textStyle : {fontSize:14}},
                animation:false,
                grid: { top : 20, bottom : 20, left : 50, right : 20 },
                xAxis: { type: 'category', show : false, },
                yAxis: { type: 'value', },
                series: [{
                    data: this.data,
                    type: 'line',
                    smooth: true
                }]
            });
        },
        
        /**
         * do nothing on refresh
         */
        refresh() {}
    },
}
</script>