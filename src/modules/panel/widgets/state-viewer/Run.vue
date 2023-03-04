<template>
  <div>
    <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
      <a-input read-only
        :addon-before="widget.label"
        :value="stateName"
        :size="widget.sizeMode" 
        :style="{width:`${widget.sizeWidth}px`}"
      />
    </a-tooltip>
  </div>
</template>
<script>
import WidgetRunViewerMixin from '../WidgetRunViewerMixin.js' 
export default {
    name : 'WidgetStateViewer',
    mixins : [WidgetRunViewerMixin],
    data() {
        return {
            /**
             * value of state
             * @property {String|Number}
             */
            value : null,
            /**
             * name of state
             * @property {String}
             */
            stateName : this.$t('panel.widgets.stateViewer.valueNameUnkown'),
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
            this.stateName = this.$t('panel.widgets.stateViewer.valueNameUnkown');
            let value = this.value;
            if ( 'number' === this.widget.valueDataType ) {
                value = parseInt(value);
            }
            
            for ( let i=0; i<this.widget.values.length; i++ ) {
                let item = this.widget.values[i];
                let itemValue = item.value;
                if ( 'number' === this.widget.valueDataType ) {
                    itemValue = parseInt(itemValue);
                }
                if ( itemValue == value ) {
                    this.stateName = item.name;
                    break;
                }
            }
        }
    },
}
</script>