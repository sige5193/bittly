<template>
  <div>
    <a-input read-only
      :addon-before="widget.label"
      :placeholder="$t('panel.widgets.stateViewer.valueName')"
      :size="widget.sizeMode" 
      :style="{width:`${widget.sizeWidth}px`}"
    />
    
    <modal-viewer-widget-setting ref="setting"
      :panel="panel"
      :widget="widget"
      :actions="null"
      :dataSources="['variable','expression','script']"
      :dataSourceVars="[{name:'sourceVariable',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :dataSourceExprs="[{name:'sourceExpression',label:$t('panel.dialogWidgetSetting.viewerVariable')}]"
      :resizable="true"
    >
      <!-- name -->
      <a-form-item :label="$t('panel.widgets.stateViewer.name')">
        <a-input ref="inputLabel" v-model="widget.label" @input="actionForceUpdate"/>
      </a-form-item>

      <!-- size -->
      <a-form-item :label="$t('panel.widgets.stateViewer.size')">
        <a-radio-group ref="radioGroupSizeMode" v-model="widget.sizeMode" @change="actionForceUpdate">
          <a-radio-button value="large">{{$t('panel.widgets.stateViewer.sizeLarge')}}</a-radio-button>
          <a-radio-button value="default">{{$t('panel.widgets.stateViewer.sizeDefault')}}</a-radio-button>
          <a-radio-button value="small">{{$t('panel.widgets.stateViewer.sizeSmall')}}</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- options -->
      <a-form-item :label="$t('panel.widgets.stateViewer.valueList')">
        <a-input-group compact v-for="(item, index) in widget.values" :key="index">
          <a-input style="width: 40%" 
            :placeholder="$t('panel.widgets.stateViewer.value')" 
            v-model="widget.values[index].value" 
            @input="actionValueItemInput(index)"
          />
          <a-input style="width: 40%" 
            :placeholder="$t('panel.widgets.stateViewer.valueName')" 
            v-model="widget.values[index].name" 
            @input="actionValueItemInput(index)"
          />
          <a-button style="width:20%" 
            @click="actionOptionDelete(index)"
          >{{$t('button.delete')}}</a-button>
        </a-input-group>
      </a-form-item>
    </modal-viewer-widget-setting>

  </div>
</template>
<script>
import WidgetMixin from '../WidgetEditMixin.js' 
export default {
    name : 'WidgetTextViewer',
    mixins : [WidgetMixin],
    methods : {
        /**
         * init widget
         * @override
         */
        initWidget() {
            this.widget.label = this.$t('panel.widgets.stateViewer.name');
            this.widget.sizeMode = 'default';
            this.widget.sizeWidth = 250;
            this.widget.values = [{name:'',value:''}];
        },

        /**
         * event handler on value item input
         * @param {Number} index
         */
        actionValueItemInput( index ) {
            if ( index === this.widget.values.length-1 ) {
                this.widget.values.push({name:'',value:''});
            }
            this.$forceUpdate();
        },

        /**
         * delete options
         */
        actionOptionDelete(index) {
            this.widget.values.splice(index, 1);
            if ( 0 == this.widget.values.length ) {
                this.widget.values.push({name:'',value:''});
            }
            this.$forceUpdate();
        },
    },
    /**
     * widget info
     * @returns {Object}
     */
    widgetInfo () {
        return {
            name:'state-viewer', 
            type:'viewer',
            label: window.app.$t('panel.widgets.stateViewer.widgetName'),
            image:require('./logo.png'),
            resizable : true,
        };
    },
}
</script>