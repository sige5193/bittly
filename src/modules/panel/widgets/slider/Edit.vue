<template>
  <div class="position-relative">
    <div class="cover"></div>
    <a-slider :class="`slider-${widget.direction}`"
      :value="widget.defaultValue*1" 
      :style="'vertical' == widget.direction ? {height:'200px'} : {width:'200px'}" 
      :min="widget.minValue*1"
      :max="widget.maxValue*1"
      :vertical="'vertical' == widget.direction"
    />

    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['variable','directive','script']"
      defaultAction="directive"
    >
      <a-form-item :label="$t('panel.widgets.slider.direction')">
        <a-radio-group v-model="widget.direction" @change="actionForceUpdate">
          <a-radio-button value="horizontal">{{$t('panel.widgets.slider.directionHorizontal')}}</a-radio-button>
          <a-radio-button value="vertical">{{$t('panel.widgets.slider.directionVertical')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item :label="$t('panel.widgets.slider.valueDefault')">
        <a-input-number class="w-100"
          ref="inputDefaultValue" 
          v-model="widget.defaultValue" 
          @change="actionForceUpdate" 
        />
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.slider.valueMin')">
        <a-input-number class="w-100" 
          ref="inputMinValue" 
          v-model="widget.minValue" 
          @change="actionForceUpdate"
        />
      </a-form-item>
    
      <a-form-item :label="$t('panel.widgets.slider.valueMax')">
        <a-input-number class="w-100" 
          ref="inputMaxValue" 
          v-model="widget.maxValue" 
          @change="actionForceUpdate"
        />
      </a-form-item>
    </modal-action-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetSlider',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.direction = 'horizontal';
            this.widget.defaultValue = 50;
            this.widget.minValue = 0;
            this.widget.maxValue = 100;
        },
    },
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'slider', 
            type : 'trigger',
            label : window.app.$t('panel.widgets.slider.widgetName'), 
            image : require('./logo.png')
        };
    },
}
</script>
<style scoped>
.cover {position: absolute;width: 100%;height: 100%;background: transparent;z-index: 99;}
.slider-horizontal {margin: 5px 6px 5px !important;}
</style>