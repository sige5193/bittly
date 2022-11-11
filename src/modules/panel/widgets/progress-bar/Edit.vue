<template>
  <div>
    <a-progress 
      :type="widget.renderType"
      :percent="30" 
      :style="'line'==widget.renderType ? {width:'300px'} : {width:'130px'}"
    />

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    >
      <a-form-item :label="$t('panel.widgets.progressBar.type')">
        <a-radio-group v-model="widget.renderType" @change="actionForceUpdate">
          <a-radio-button value="line">{{$t('panel.widgets.progressBar.typeLine')}}</a-radio-button>
          <a-radio-button value="circle">{{$t('panel.widgets.progressBar.typeCircle')}}</a-radio-button>
          <a-radio-button value="dashboard">{{$t('panel.widgets.progressBar.typeDashboard')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="$t('panel.widgets.progressBar.valueMin')">
        <a-input ref="inputMinValue" v-model="widget.minValue" @input="actionForceUpdate" />
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.progressBar.valueMax')">
        <a-input ref="inputMaxValue" v-model="widget.maxValue" @input="actionForceUpdate"/>
      </a-form-item>

    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetProgressViewer',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.renderType = 'line';
            this.widget.minValue = 0;
            this.widget.maxValue = 100;
        },
    },
    /**
     * widget info
     */
    widgetInfo () {
        return {
            name:'progress-bar', 
            type:'viewer', 
            label : window.app.$t('panel.widgets.progressBar.widgetName'),
            image:require('./logo.png')
        };
    },
}
</script>