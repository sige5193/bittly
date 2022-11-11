<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <span>{{widget.text}}</span>
  </a-tooltip>
</template>
<script>
import WidgetRunMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetLabel',
    mixins : [WidgetRunMixin]
}
</script>