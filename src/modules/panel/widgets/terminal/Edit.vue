<template>
  <div class="terminal" :style="{width:`${widget.sizeWidth}px`,height:`${widget.sizeHeight}px`}">
    <div>
      <p class="mb-0">10:11:11.009</p>
      <pre class="mb-0 content-data">this is a terminal. </pre>
    </div>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :resizable="true"
      :tooltip-available="false"
    >    
      <!-- select data source -->
      <a-form-item :label="$t('panel.dialogWidgetSetting.viewerVariable')">
        <variable-selector
          ref="varSelectorSourceVar"
          v-model="widget.sourceVariable"
          :panel="panel"
          @change="actionForceUpdate"
        ></variable-selector>
      </a-form-item>
    </modal-viewer-widget-setting>
  </div>
</template>
<script>
import VariableSelector from '../../variable/Selector.vue'
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'EditWidgetTerminal',
    mixins : [WidgetMixin],
    components : {
        'variable-selector' : VariableSelector
    },
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeHeight = 300;
            this.widget.sizeWidth = 300;
        },
    },
    /**
     * get widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name : 'terminal', 
            type : 'viewer',
            label: window.app.$t('panel.widgets.terminal.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.terminal {
    background: black;
    color: green;
    border: solid #959595 2px;
    padding: 5px;
    font-weight: 600;
    overflow: auto;
}
.content-data {
    word-break: break-all;
    white-space: break-spaces;
}
</style>