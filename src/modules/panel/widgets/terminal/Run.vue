<template>
  <div ref="terminal" class="terminal" :style="{width:`${widget.sizeWidth}px`,height:`${widget.sizeHeight}px`}">
    <div v-for="(item, index) in contents" :key="index">
      <pre class="mb-0 content-data">{{item.time | time}} {{item.data}}</pre>
    </div>
  </div>
</template>
<script>
import Formatter from '../../../../utils/Formatter.js'
import WidgetMixin from '../WidgetRunMixin.js' 
export default {
    name : 'EditWidgetTerminal',
    mixins : [WidgetMixin],
    data() {
        return {
            contents : [],
        };
    },
    filters : {
        time (value) {
            return Formatter.asTimeDotMS(value);
        },
    },
    methods : {
        /**
         * init widget
         */    
        initWidget() {
            this.addVariableWatcher( this.widget.sourceVariable, newValue => this.processNewData(newValue));
        },

        /**
         * process new data
         */
        processNewData( value ) {
            if ( null != value && 'function' == typeof(value.toString)) {
                value = value.toString();
                this.contents.push({
                    time : new Date(),
                    data : value,
                });
            }
            this.$forceUpdate();

            let elem = this.$refs.terminal;
            this.$nextTick(() => elem.scrollTop = elem.scrollHeight);
        },
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
    overflow-y: scroll;
}
.content-data {
    word-break: break-all;
    white-space: break-spaces;
}
</style>