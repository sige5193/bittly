<template>
  <div>
    <vue-thermometer
      :value="demoValue"
      :min="widget.minValue * 1"
      :max="widget.maxValue * 1"
      :options="demoOptions"
    />

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :resizable="true"
    >
      <a-form-item :label="$t('panel.widgets.thermometer.valueMin')">
        <a-input ref="inputMinValue" v-model="widget.minValue" @input="actionForceUpdate"/>
      </a-form-item>
    
      <a-form-item :label="$t('panel.widgets.thermometer.valueMax')">
        <a-input ref="inputMaxValue" v-model="widget.maxValue" @input="actionForceUpdate"/>
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.thermometer.tickCount')">
        <a-input ref="inputTickCount" v-model="widget.tickCount" @input="actionForceUpdate"/>
      </a-form-item>
    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetThermometer',
    mixins : [WidgetMixin],
    data() {
        return {
            demoValue : 0,
            demoOptions : {},
        };
    },
    mounted() {
        this.actionForceUpdate();
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
            this.widget.tickCount = 5;
            this.actionForceUpdate();
        },

        /**
         * update editor view
         */
        actionForceUpdate() {
            this.demoValue = (this.widget.maxValue - this.widget.minValue) / 2;
            this.demoOptions = {
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
                    ticks: this.widget.tickCount,
                    ticksEnabled: true,
                    tickColor: 'black',
                    tickWidth: '1'
                },
                layout: {
                    height: this.widget.sizeHeight,
                    width: this.widget.sizeWidth
                }
            };
            this.$forceUpdate();
        },
    },
    
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name:'thermometer', 
            type:'viewer',
            label:window.app.$t('panel.widgets.thermometer.widgetName'),
            image:require('./logo.png'),
            resizable : true,
        };
    },
}
</script>