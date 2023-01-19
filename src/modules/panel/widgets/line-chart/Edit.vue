<template>
  <div>
    <div class="bg-white" ref="chart"></div>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :resizable="true"
      :tooltip-available="false"
    >
      <!-- title -->
      <a-form-item :label="$t('panel.widgets.lineChart.title')">
        <a-input ref="inputTitle" class="w-100" v-model="widget.title" @input="actionForceUpdate"/>
      </a-form-item>
      
      <!-- x size -->
      <a-form-item :label="$t('panel.widgets.lineChart.maxDataLength')">
        <a-input-number ref="inputMaxDataLength" class="w-100" v-model="widget.maxDataLength" @input="actionForceUpdate"/>
      </a-form-item>
      
      <!-- watch variable -->
      <a-form-item :label="$t('panel.widgets.lineChart.watchVariable')">
        <variable-selector ref="variableSelectorWatchVariable"
          v-model="widget.watchVariable"
          :panel="panel" 
          @change="actionForceUpdate"
        ></variable-selector>
      </a-form-item>
     
      <!-- data expression -->
      <a-form-item :label="$t('panel.widgets.lineChart.dataExpression')">
        <a-input class="w-100" v-model="widget.dataExpression" ref="inputDataExpression" 
          :placeholder="`{{value}} + {{variable}} * 10 + 1`"
        />
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import VariableSelector from '../../variable/Selector.vue'
import WidgetMixin from '../WidgetEditMixin.js' 
import * as echarts from 'echarts';
export default {
    name : 'EditWidgetChartLine',
    mixins : [WidgetMixin],
    components : {
        'variable-selector' : VariableSelector
    },
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
            this.widget.title = '';
            this.widget.maxDataLength = 50;
            this.widget.sizeHeight = 200;
            this.widget.sizeWidth = 200;
            this.widget.dataExpression = '{{value}}';
        },

        /**
         * force update
         */
        actionForceUpdate() {
            this.refreshChart();
            this.$forceUpdate();
        },
        
        /**
         * refresh charts
         */
        refreshChart() {
            if ( null != this.chart ) {
                this.chart.dispose();
            }

            this.chart = echarts.init(this.$refs.chart, null, {
                width: this.widget.sizeWidth * 1,
                height: this.widget.sizeHeight * 1,
            });
            this.chart.setOption({
                title : {
                    text : this.widget.title,
                    x : 'center',
                    padding : 2,
                    textStyle : {fontSize:14},
                },
                grid: {
                    top : 20,
                    bottom : 20,
                    left : 50,
                    right : 20,
                },
                xAxis: {
                    type: 'category',
                    show : false,
                },
                yAxis: {
                    type: 'value',
                },
                series: [{
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                    smooth: true
                }]
            });
        },

        /**
         * done config
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
            name : 'line-chart', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.lineChart.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>