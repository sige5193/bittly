<!--
 - widget : text input
-->
<template>
  <div class="position-relative">
    <div class="cover"></div>
    <div :style="{width:`${widget.sizeWidth}px`}" :class="`d-flex flex-dir-row act-${widget.action}`">
      <a-input ref="inputText" :size="widget.sizeMode" :placeholder="$t('panel.widgets.textInput.content')" />
      <a-button v-if="'directive' == widget.action" :size="widget.sizeMode">{{$t('button.send')}}</a-button>
      <a-button v-if="'script' == widget.action" :size="widget.sizeMode">{{$t('button.execute')}}</a-button>
    </div>
    
    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['variable','directive','script']"
      defaultAction="directive"
    >
      <!-- size -->
      <a-form-item :label="$t('panel.widgets.textInput.size')">
        <a-radio-group ref="radioGroupSizeMode" v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.textInput.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.textInput.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.textInput.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-action-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetTextInput',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeMode = 'default';
            this.widget.sizeWidth = 250;
        },
    },
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'text', 
            type : 'trigger', 
            label : window.app.$t('panel.widgets.textInput.widgetName'), 
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