<template>
  <div class="position-relative">
    <div class="cover"></div>
    <div :style="{width:`${widget.sizeWidth}px`}" :class="`d-flex flex-dir-row act-${widget.action}`">
      <a-input read-only ref="inputNumber" type="number" :size="widget.sizeMode"
        :placeholder="$t('panel.widgets.numberInput.placeholder')"
      />
      <a-button v-if="'directive' == widget.action" :size="widget.sizeMode">{{$t('button.send')}}</a-button>
      <a-button v-if="'script' == widget.action" :size="widget.sizeMode">{{$t('button.execute')}}</a-button>
    </div>
    
    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['variable','directive','script']"
      defaultAction="directive"
    >
      <!-- default value -->
      <a-form-item :label="$t('panel.widgets.numberInput.defaultValue')">
        <a-input-number class="w-100" ref="inputDefaultValue" v-model="widget.defaultValue" @change="actionForceUpdate"/>
      </a-form-item>

      <!-- min value -->
      <a-form-item :label="$t('panel.widgets.numberInput.minValue')">
        <a-input-number class="w-100" ref="inputMinValue" v-model="widget.minValue" @change="actionForceUpdate"/>
      </a-form-item>

      <!-- max value -->
      <a-form-item :label="$t('panel.widgets.numberInput.maxValue')">
        <a-input-number class="w-100" ref="inputMaxValue" v-model="widget.maxValue" @change="actionForceUpdate"/>
      </a-form-item>

      <!-- step value -->
      <a-form-item :label="$t('panel.widgets.numberInput.stepValue')">
        <a-input-number class="w-100" ref="inputStepValue" v-model="widget.stepValue" @change="actionForceUpdate"/>
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.numberInput.size')">
        <a-radio-group ref="radioGroupSizeMode" v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.numberInput.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.numberInput.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.numberInput.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-action-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetNumberInput',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeMode = 'default';
            this.widget.defaultValue = 0;
            this.widget.minValue = 0;
            this.widget.maxValue = 100;
            this.widget.stepValue = 1;
            this.widget.sizeWidth = 250;
        },
    },
    /**
     * widget info
     */
    widgetInfo () {
        return {
            name : 'number', 
            type : 'trigger',
            label : window.app.$t('panel.widgets.numberInput.widgetName'), 
            image : require('./logo.png'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.cover {position: absolute;width: 100%;height: 100%;background: transparent;z-index: 99;}
.act-script input, .act-directive input {border-top-right-radius:0;border-bottom-right-radius: 0;}
.act-script button, .act-directive button {border-top-left-radius:0;border-bottom-left-radius: 0;}
</style>