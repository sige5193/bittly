<template>
  <div>
    <a-switch 
      :size="widget.sizeMode"
      :checked-children="$t('panel.widgets.switch.on')" 
      :un-checked-children="$t('panel.widgets.switch.off')" 
      :checked="widget.initStatus"
    />

    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['variable','directive','script']"
      defaultAction="directive"
    >
      <a-form-item :label="$t('panel.widgets.switch.initStatus')">
        <a-switch 
          ref="switchInitStatus"
          :checked-children="$t('panel.widgets.switch.on')" 
          :un-checked-children="$t('panel.widgets.switch.off')" 
          v-model="widget.initStatus" 
          @change="actionForceUpdate"
        />
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.switch.valueOn')">
        <a-input ref="inputValueOn" v-model="widget.valueOn" @input="actionForceUpdate" />
      </a-form-item>
      
      <a-form-item :label="$t('panel.widgets.switch.valueOff')">
        <a-input ref="inputValueOff" v-model="widget.valueOff" @input="actionForceUpdate" />
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.switch.size')">
        <a-radio-group v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="default">{{$t('panel.widgets.switch.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.switch.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

    </modal-action-widget-setting>

  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetSwitch',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeMode = 'default';
            this.widget.initStatus = false;
            this.widget.valueOn = 'ON';
            this.widget.valueOff = 'OFF';
        },
    },

    /**
     * widget info
     */
    widgetInfo () {
        return {
            name : 'switch', 
            type : 'trigger',
            label : window.app.$t('panel.widgets.switch.widgetName'), 
            image : require('./icon.png')
        };
    },
}
</script>