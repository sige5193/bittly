<template>
  <div class="position-relative">
    <div class="cover"></div>
    <a-input 
      read-only
      ref="inputNumber"
      :style="{width:`${widget.sizeWidth}px`}"
      :size="widget.sizeMode"
      :placeholder="$t('panel.widgets.numberViewer.placeholder')" 
      :addon-before="widget.prefix"
      :addon-after="widget.suffix"
    />
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    >
      <!-- prefix -->
      <a-form-item :label="$t('panel.widgets.numberViewer.prefix')">
        <a-input ref="inputPrefix" class="w-100" v-model="widget.prefix" @input="actionForceUpdate"/>
      </a-form-item>
      
      <!-- suffix  -->
      <a-form-item :label="$t('panel.widgets.numberViewer.suffix')">
        <a-input ref="inputSuffix" class="w-100" v-model="widget.suffix" @input="actionForceUpdate"/>
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.numberViewer.size')">
        <a-radio-group ref="radioGroupSizeMode" v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.numberViewer.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.numberViewer.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.numberViewer.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetNumberViewer',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeMode = 'default';
            this.widget.sizeWidth = 200;
        },
    },
    /**
     * 组件信息
     */
    widgetInfo () {
        return {
            name: 'number-viewer', 
            type: 'viewer',
            label: window.app.$t('panel.widgets.numberViewer.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.cover {position: absolute;width: 100%;height: 100%;background: transparent;z-index: 99;}
</style>