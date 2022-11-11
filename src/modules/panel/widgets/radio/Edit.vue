<template>
  <div>
    <a-radio-group button-style="solid" :size="widget.sizeMode" :value="`${widget.defaultValue}`">
      <a-radio-button v-for="(item, index) in widget.options" :key="index" :value="`${item.value}`">
        {{item.name}}
      </a-radio-button>
    </a-radio-group>

    <modal-action-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="['variable','directive','script']"
      defaultAction="directive"
    >
      <!-- default value -->
      <a-form-item :label="$t('panel.widgets.radio.valueDefault')">
        <a-input ref="inputDefaultValue" v-model="widget.defaultValue" @input="actionForceUpdate" />
      </a-form-item>
      
      <!-- options -->
      <a-form-item :label="$t('panel.widgets.radio.options')">
        <a-input-group compact v-for="(item, index) in widget.options" :key="index">
          <a-input ref="inputRadioOptionName" style="width: 40%" 
            :placeholder="$t('panel.widgets.radio.optionName')" 
            v-model="widget.options[index].name" 
            @input="actionForceUpdate"
          />
          <a-input ref="inputRadioOptionValue" style="width: 40%" 
            :placeholder="$t('panel.widgets.radio.optionValue')" 
            v-model="widget.options[index].value" 
            @input="actionForceUpdate"
          />
          <a-button ref="btnRadioOptionDelete" style="width:20%" 
            @click="actionOptionDelete(index)"
          >{{$t('button.delete')}}</a-button>
        </a-input-group>
        <div class="text-right"> 
          <a-button ref="btnRadioOptionAdd" @click="actionOptionAdd">{{$t('button.add')}}</a-button>
        </div>
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.radio.size')">
        <a-radio-group v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.radio.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.radio.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.radio.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </modal-action-widget-setting>
  </div>
</template>
<script>
import WidgetEditMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetRadio',
    mixins : [WidgetEditMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.sizeMode = 'default';
            this.widget.defaultValue = 1;
            this.widget.options = [
                {name: this.$t('panel.widgets.radio.valueDefaultOption1'), value:'1'},
                {name: this.$t('panel.widgets.radio.valueDefaultOption2'), value:'2'},
                {name: this.$t('panel.widgets.radio.valueDefaultOption3'), value:'3'}
            ];
        },

        /** 
         * add options
         */
        actionOptionAdd() {
            this.widget.options.push({name:'',value:'',});
            this.$forceUpdate();
        },

        /**
         * delete options
         */
        actionOptionDelete(index) {
            this.widget.options.splice(index, 1);
            if ( 0 == this.widget.options.length ) {
                this.actionOptionAdd();
            }
            this.$forceUpdate();
        },
    },

    /**
     * get widget info
     */
    widgetInfo () {
        return {
            name : 'radio', 
            type : 'trigger',
            label : window.app.$t('panel.widgets.radio.widgetName'), 
            image : require('./logo.png')
        };
    },
}
</script>