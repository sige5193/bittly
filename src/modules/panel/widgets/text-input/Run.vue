<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <div :style="{width:`${widget.sizeWidth}px`}" :class="`d-flex flex-dir-row act-${widget.action}`">
        <a-input ref="inputText" v-model="value" :size="widget.sizeMode" 
          :disabled="isExecuting"
          :placeholder="$t('panel.widgets.textInput.content')"
          @change="actionInputChange"
        />
        <a-button v-if="'directive' == widget.action" ref="btnSend"
          :size="widget.sizeMode"
          :loading="isExecuting"
          @click="actionExecute"
        >{{$t('button.send')}}</a-button>
        <a-button v-if="'script' == widget.action" ref="btnSend"
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
    name : 'WidgetTextInput',
    mixins : [WidgetRunMixin],
    data() {
        return {
            value : '',
        };
    },
    methods : {
        /**
         * get value of this widget
         */
        valueGet() {
            return this.value;
        },

        /**
         * auto execute action if action is `variable`
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
.act-script input, .act-directive input {border-top-right-radius:0;border-bottom-right-radius: 0;}
.act-script button, .act-directive button {border-top-left-radius:0;border-bottom-left-radius: 0;}
</style>