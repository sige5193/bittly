<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <div :style="{width:`${widget.sizeWidth}px`}" :class="`d-flex flex-dir-row act-${widget.action}`">
        <a-input-number ref="inputText" v-model="value" class="flex-grow"
          :size="widget.sizeMode"
          :min="widget.minValue"
          :max="widget.maxValue"
          :step="widget.stepValue"
          :placeholder="$t('panel.widgets.numberInput.placeholder')"
          :disabled="isExecuting"
          @change="actionInputChange"
        />
        <a-button v-if="'directive' == widget.action" ref="btnSend"
          :size="widget.sizeMode"
          :loading="isExecuting"
          @click="actionExecute"
        >{{$t('button.send')}}</a-button>
        <a-button v-if="'script' == widget.action"
          ref="btnSend" 
          :size="widget.sizeMode"
          :loading="isExecuting"
          @click="actionExecute"
        >{{$t('button.execute')}}</a-button>
      </div>
    </a-tooltip>
  </div>
</template>
<script>
import WidgetRunMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetNumber',
    mixins : [WidgetRunMixin],
    data() {
        return {
            value : this.widget.defaultValue,
        };
    },
    methods : {
        /**
         * get widget value
         */
        valueGet() {
            return this.value;
        },

        /**
         * event handler for number input changed, if action is `variable`,
         * update the value to that variable.
         */
        actionInputChange() {
            if ( 'variable' == this.widget.action ) {
                this.actionExecute();
            }
        }
    },
}
</script>
<style scoped>
.cover {position: absolute;width: 100%;height: 100%;background: transparent;z-index: 99;}
.act-script .ant-input-number, .act-directive .ant-input-number {border-top-right-radius:0;border-bottom-right-radius: 0;}
.act-script button, .act-directive button {border-top-left-radius:0;border-bottom-left-radius: 0;}
</style>