<template>
  <div class="container">
    <a-icon type="history" class="text-large" />
    <span class="text-large ml-2 mr-2">00:01</span>
    <a-button style="vertical-align: bottom;">
      <a-icon type="play-circle" />
    </a-button>

    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['directive','script']"
      defaultAction="directive"
    >
      <a-form-item :label="$t('panel.widgets.timer.interval')">
        <a-input-group compact>
          <a-input-number ref="inputInterval" style="width:85%;" 
            :step="1"
            :min="0"
            v-model="widget.interval" 
            @change="actionForceUpdate"
          />
          <a-input style="width:15%;" class="text-body" 
            :value="$t('panel.widgets.timer.intervalUnit')" 
            disabled
          />
        </a-input-group>
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.timer.count')">
        <a-input-number ref="inputCount" class="w-100" 
          :min="0"  
          v-model="widget.count" 
          @change="actionForceUpdate"
        />
      </a-form-item>
    </modal-action-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'EditWidgetTimer',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.interval = 1;
            this.widget.count = 5;
        },
    },
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name: 'timer', 
            type: 'trigger',
            label: window.app.$t('panel.widgets.timer.widgetName'),
            image: require('./logo.png')
        };
    },
}
</script>
<style scoped>
.container {
    border: solid 1px #c7c7c7;
    padding: 2px 10px;
    border-radius: 5px;
    background: white;
}
</style>