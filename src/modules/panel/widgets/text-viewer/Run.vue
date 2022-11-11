<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-textarea 
        read-only
        ref="input"
        :placeholder="$t('panel.widgets.textViewer.placeholder')"
        :style="{width:`${widget.sizeWidth}px`,height:`${widget.sizeHeight}px`}" 
        :value="content" 
      />
    </a-tooltip>
  </div>
</template>
<script>
import WidgetRunViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetTextViewer',
    mixins : [WidgetRunViewerMixin],
    data() {
        return {
            value : null,
            content : '',
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
            if ( null != this.value && 'function' == typeof(this.value.toString)) {
                this.content = this.value.toString();
            }
        }
    },
}
</script>