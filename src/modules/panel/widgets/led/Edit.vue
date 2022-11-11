<template>
  <div>
    <div>
      <div v-if="'digital' == widget.mode" :class="`led-light ${widget.color}`"></div>
      <div v-else class="led-light" style="background:white;">
        <div :class="`led-core ${widget.color}`"></div>
      </div>
    </div>
    <div class="led-base"></div>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression', 'script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
    >
      <!-- color -->
      <a-form-item :label="$t('panel.widgets.led.color')">
        <a-radio-group ref="radioGroupColor" v-model="widget.color" @change="actionForceUpdate">
          <a-radio value="blue"><a-icon theme="twoTone" two-tone-color="blue" type="bulb" /></a-radio>
          <a-radio value="gray"><a-icon theme="twoTone" two-tone-color="gray" type="bulb" /></a-radio>
          <a-radio value="green"><a-icon theme="twoTone" two-tone-color="green" type="bulb" /></a-radio>
          <a-radio value="red"><a-icon theme="twoTone" two-tone-color="red" type="bulb" /></a-radio>
          <a-radio value="yellow"><a-icon theme="twoTone" two-tone-color="#ff9e1b" type="bulb" /></a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- mode -->
      <a-form-item :label="$t('panel.widgets.led.mode')">
        <a-radio-group v-model="widget.mode" @change="actionForceUpdate">
          <a-radio-button value="digital">{{$t('panel.widgets.led.modeDigital')}}</a-radio-button>
          <a-radio-button value="analog">{{$t('panel.widgets.led.modeAnalog')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- analog mode -->
      <template v-if="'analog' == widget.mode">
        <a-form-item :label="$t('panel.widgets.led.valueMin')">
          <a-input ref="inputMinValue" v-model="widget.minValue" @change="actionForceUpdate"/>
        </a-form-item>
      
        <a-form-item :label="$t('panel.widgets.led.valueMax')">
          <a-input ref="inputMaxValue" v-model="widget.maxValue" @change="actionForceUpdate"/>
        </a-form-item>
      </template>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'EditWidgetLed',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.mode = 'digital';
            this.widget.minValue = 0;
            this.widget.maxValue = 255;
            this.widget.color = 'red';
            this.$forceUpdate();
        },
    },

    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'led', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.led.widgetName'),
            image: require('./logo.png')
        };
    },
}
</script>
<style scoped>
.led-base {background: #b1b1b1;height: 10px;width: 24px;border-radius: 3px 3px 0 0;}
.led-light {height: 16px;width: 21px;margin: auto;border-radius: 10px 10px 0 0;}
.led-light.blue {background: #8686d1;}
.led-light.gray {background: #bbbbbb;}
.led-light.green {background: #abc5ab;}
.led-light.red {background:#c39393;}
.led-light.yellow {background:#bdbd7b;}
.led-core {width: 5px;height: 5px;display: inline-block;margin: 10px 8px;border-radius: 50% 50% 0 0;}
.led-core.blue {background: #8686d1;}
.led-core.gray {background: #bbbbbb;}
.led-core.green {background: #abc5ab;}
.led-core.red {background:#c39393;}
.led-core.yellow {background:#f2f23b;}
</style>