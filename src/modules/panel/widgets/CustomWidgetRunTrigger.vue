<template>
  <div>
    <component v-if="'' != name" :is="`panel-widget-${name}`"></component>
  </div>
</template>
<script>
import WidgetRunMixin from './WidgetRunMixin.js'
export default {
    name : 'PanelWidgetCustomWidgetRunTrigger',
    mixins : [WidgetRunMixin],
    props : {
        /**
         * name of widget 
         * @property {String}
         */
        name : {type:String, default:''},
    },
}
</script>