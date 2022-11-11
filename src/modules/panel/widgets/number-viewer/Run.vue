<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-input 
        read-only
        ref="input"
        :style="{width:`${widget.sizeWidth}px`}"
        :placeholder="$t('panel.widgets.numberViewer.placeholder')" 
        :size="widget.sizeMode"
        :value="content"
        :addon-before="widget.prefix"
        :addon-after="widget.suffix"
      />
    </a-tooltip>
  </div>
</template>
<script>
import WidgetViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetNumberViewer',
    mixins : [WidgetViewerMixin],
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
         * value map
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
                this.content = this.value.toString() * 1;
            }
        }
    },
}
</script>