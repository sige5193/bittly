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
      <!-- value min -->
      <a-form-item :label="$t('panel.widgets.liquidfill.valueMin')">
        <a-input-number ref="inputMinValue" class="w-100" v-model="widget.minValue" @change="actionForceUpdate"/>
      </a-form-item>
      
      <!-- value max -->
      <a-form-item :label="$t('panel.widgets.liquidfill.valueMax')">
        <a-input-number ref="inputMaxValue" class="w-100" v-model="widget.maxValue" @change="actionForceUpdate"/>
      </a-form-item>

    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
import * as echarts from 'echarts';
import 'echarts-liquidfill'
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
            this.widget.sizeHeight = 100;
            this.widget.sizeWidth = 100;
        },

        /**
         * update widget
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
            });
            this.chart.setOption({
                series: [{
                    type: 'liquidFill',
                    radius: '90%',
                    data: [0.6],
                    label: {
                        fontSize: 24,
                    },
                    outline: {
                        show: false
                    }
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
     * get widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'liquidfill', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.liquidfill.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>