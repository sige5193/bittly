<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-radio-group ref="radioGroup"
        button-style="solid" 
        v-model="value"
        :size="widget.sizeMode"
        :disabled="isExecuting"
        @change="actionExecute" 
      >
        <a-radio-button ref="radioOption"
          v-for="(item, index) in widget.options" 
          :key="index" 
          :value="`${item.value}`"
        >{{item.name}}</a-radio-button>
      </a-radio-group>
    </a-tooltip>
  </div>
</template>
<script>
import WidgetRunMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetRadio',
    mixins : [WidgetRunMixin],
    data() {
        return {
            value : `${this.widget.defaultValue}`,
        }
    },
    methods : {
        /**
         * get value of this widget
         */
        valueGet() {
            return this.value;
        },
    },
}
</script>