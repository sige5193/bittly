<template>
  <div class="panel-run-widget-progress-bar">
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-progress 
        :percent="percent" 
        :type="widget.renderType"
        :style="'line'==widget.renderType ? {width:'300px'} : {width:'130px'}"
      />
    </a-tooltip>
  </div>
</template>
<script>
import WidgetRunViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetProgress',
    mixins : [WidgetRunViewerMixin],
    data() {
        return {
            value : null,
            percent : this.widget.minValue * 1,
        };
    },
    methods : {
        /**
         * get attribute expression map
         * @override
         */
        getAttributeExpressionMap() {
            return [{name:'value',expr:this.widget.sourceExpression}];
        },
        
        /**
         * get value map
         * @override
         */
        getVariableMap() {
            let map = {};
            map[this.widget.sourceVariable] = 'value';
            return map;
        },


        /**
         * update widget
         * @override
         */
        updateWidget() {
            let min = this.widget.minValue * 1;
            let max = this.widget.maxValue * 1;
            let val = this.value * 1;
            if ( val < min ) {
                val = min;
            }
            if ( val > max ) {
                val = max;
            }
            
            let range = max - min;
            let calval = val - min;
            this.percent = calval * 100 / range;
        },
    },
}
</script>
<style>
.panel-run-widget-progress-bar .ant-progress-inner {background: #d9d9d9;}
</style>