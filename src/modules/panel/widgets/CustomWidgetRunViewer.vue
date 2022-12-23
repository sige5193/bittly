<template>
  <div>
    <component ref="widget" v-if="'' != name" :is="`panel-widget-${name}`"></component>
  </div>
</template>
<script>
import WidgetRunViewerMixin from './WidgetRunViewerMixin.js'
export default {
    name : 'PanelWidgetCustomWidgetRunViewer',
    mixins : [WidgetRunViewerMixin],
    props : {
        /**
         * name of widget 
         * @property {String}
         */
        name : {type:String, default:''},
    },
    mounted() {
        this.$refs.widget.setWrapper(this);
    },
    methods : {
        /**
         * refresh the widget
         */
        refresh() {
            this.$refs.widget.refresh();
        },
    }
}
</script>