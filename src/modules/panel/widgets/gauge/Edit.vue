<template>
  <div>
    <div ref="chart"></div>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :resizable="true"
    >
      <a-form-item :label="$t('panel.widgets.gauge.valueMin')">
        <a-input ref="inputMinValue" v-model="widget.minValue" @change="actionForceUpdate"/>
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.gauge.valueMax')">
        <a-input ref="inputMaxValue" v-model="widget.maxValue" @change="actionForceUpdate"/>
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.gauge.splitNumber')">
        <a-input ref="inputSplitNumber" v-model="widget.splitNumber" @change="actionForceUpdate"/>
      </a-form-item>
    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
import * as echarts from 'echarts';
export default {
    name : 'WidgetGauge',
    mixins : [WidgetMixin],
    data() {
        return {
            chart : null,
        };
    },
    mounted() {
        this.actionForceUpdate();
    },
    destroyed() {
        this.chart.dispose();
    },
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.minValue = 0;
            this.widget.maxValue = 100;
            this.widget.splitNumber = 5;
            this.widget.sizeHeight = 100;
            this.widget.sizeWidth = 100;
        },

        /**
         * update
         */
        actionForceUpdate() {
            this.refreshChart();
            this.$forceUpdate();
        },
        
        /**
         * refresh chart
         */
        refreshChart() {
            if ( null != this.chart ) {
                this.chart.dispose();
            }

            this.chart = echarts.init(this.$refs.chart, null, {
                width: this.widget.sizeWidth * 1,
                height: this.widget.sizeHeight * 1,
                renderer: 'svg'
            });
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
                    data: [{
                        value: (this.widget.maxValue - this.widget.minValue) / 2
                    }]
                }]
            });
        },

        /**
         * done setting
         */
        onSettingOK() {
            this.refreshChart();
        },
    },
    
    /**
     * widget info
     */
    widgetInfo () {
        return {
            name : 'gauge', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.gauge.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>