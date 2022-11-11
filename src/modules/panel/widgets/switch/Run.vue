<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-switch 
        ref="switch"
        v-model="value"
        :size="widget.sizeMode"
        :loading="isExecuting" 
        :checked-children="$t('panel.widgets.switch.on')" 
        :un-checked-children="$t('panel.widgets.switch.off')"
        @change="actionExecute"
      />
    </a-tooltip>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetSwitch',
    mixins : [WidgetMixin],
    data() {
        return {
            value : this.widget.initStatus,
        };
    },
    methods : {
        /**
         * get value of switch
         */
        valueGet() {
            return this.value 
            ? this.widget.valueOn 
            : this.widget.valueOff;
        },
    },
}
</script>