<template>
  <div>
    <component v-if="'' != name" :is="`panel-widget-${name}`"></component>
    
    <!-- setting modal -->
    <component ref="setting" :is="settingComponent"
      :panel="panel"
      :widget="widget"
      :actions="widget.actions"
      :defaultAction="widget.defaultAction"
      :tooltipAvailable="widget.tooltipAvailable"
    >
      <a-form-item v-for="(widgetProp, widgetPropIndex) in widget.properties" :key="widgetPropIndex" :label="widgetProp.label">
        <!-- number input -->
        <a-input-number v-if="'input-number' == widgetProp.editor" 
          class="w-100" 
          v-model="widget[widgetProp.name]"
          :max="widgetProp.max || Infinity"
          :min="widgetProp.min || -Infinity"
          :step="widgetProp.step || 1"
          @change="actionForceUpdate"
        />
        <!-- input -->
        <a-input v-if="'input' == widgetProp.editor" 
          class="w-100" 
          v-model="widget[widgetProp.name]"
          :addonBefore="widgetProp.prefix || ''" 
          :addonAfter="widgetProp.suffix || ''"
          :max-length="widgetProp.maxLength"
          @change="actionForceUpdate"
        />
        <!-- checkbox -->
        <a-checkbox v-if="'checkbox' == widgetProp.editor" 
          v-model="widget[widgetProp.name]"
          @change="actionForceUpdate"
        />
        <!-- slider -->
        <a-slider v-if="'slider' == widgetProp.editor" 
          class="w-100" 
          v-model="widget[widgetProp.name]"
          :max="widgetProp.max || 100"
          :min="widgetProp.min || 0"
          @change="actionForceUpdate"
        />
        <!-- switch -->
        <a-switch v-if="'switch' == widgetProp.editor" 
          v-model="widget[widgetProp.name]"
          @change="actionForceUpdate"
        />
        <!-- select -->
        <a-select v-if="'select' == widgetProp.editor" 
          v-model="widget[widgetProp.name]"
          :mode="widgetProp.mode || 'default'"
          @change="actionForceUpdate"
        >
          <a-select-option v-for="(widgetPropSltOpt, widgetPropSltOptIndex) in widgetProp.options" 
            :key="widgetPropSltOptIndex" 
            :value="widgetPropSltOpt.value"
          >{{widgetPropSltOpt.label}}</a-select-option>
        </a-select>
        <!-- radio -->
        <a-radio-group  v-if="'radio' == widgetProp.editor"
          v-model="widget[widgetProp.name]"
          @change="actionForceUpdate"
        >
          <a-radio v-for="(widgetPropSltOpt, widgetPropSltOptIndex) in widgetProp.options" 
            :key="widgetPropSltOptIndex" 
            :value="widgetPropSltOpt.value"
          >{{widgetPropSltOpt.label}}</a-radio>
        </a-radio-group>
      </a-form-item>
    </component>
  </div>
</template>
<script>
import WidgetEditMixin from './WidgetEditMixin.js'
export default {
    name : 'PanelWidgetCustomWidgetEdit',
    mixins : [WidgetEditMixin],
    props : {
        /**
         * name of widget 
         * @property {String}
         */
        name : {type:String, default:''},
        /**
         * instance of widget
         * @property {Object}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * @property {String}
             */
            settingComponent : 'modal-action-widget-setting',
        };
    },
    methods : {
        /**
         * init widget if widget is new or have not inited
         * @override
         */
        initWidget() {
            if ( 'trigger' != this.widget.type ) {
                this.settingComponent = 'modal-viewer-widget-setting';
            }
            for ( let i=0; i<this.widget.properties.length; i++ ) {
                let prop = this.widget.properties[i];
                if ( undefined != prop.default ) {
                    this.widget[prop.name] = prop.default;
                }
            }
        },
    },
}
</script>