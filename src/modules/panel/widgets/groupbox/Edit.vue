<template>
  <div>
    <fieldset class="groupbox" :style="{width: `${widget.sizeWidth}px`,height: `${widget.sizeHeight}px`}">
      <legend>{{widget.title}}</legend>
    </fieldset>

    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :resizable="true"
      :tooltip-available="false"
    >
      <a-form-item :label="$t('panel.widgets.groupbox.title')">
        <a-input 
          ref="inputTitle"
          v-model="widget.title" 
          @input="actionForceUpdate"
        />
      </a-form-item>
    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetSlider',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.title = this.$t('panel.widgets.groupbox.defaultTitle');
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
            name: 'groupbox', 
            type: 'viewer',
            label: window.app.$t('panel.widgets.groupbox.widgetName'),
            image: require('./logo.png'),
            resizable : true,
        };
    },
}
</script>
<style scoped>
.groupbox {
    border: solid 1px #7e7e7e;
    padding: 5px;
}
.groupbox > legend {
    width: auto !important;
    padding: 0 5px !important;
    font-size: 1em !important;
}
</style>