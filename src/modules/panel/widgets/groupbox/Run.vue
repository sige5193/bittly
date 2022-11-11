<template>
  <div>
    <fieldset class="groupbox" :style="{width: `${widget.sizeWidth}px`,height: `${widget.sizeHeight}px`}">
      <legend class="grouptitle">{{widget.title}}</legend>
    </fieldset>
  </div>
</template>
<script>
import WidgetMixin from '../WidgetRunMixin.js' 
export default {
    name : 'WidgetSlider',
    mixins : [WidgetMixin],
}
</script>
<style scoped>
.groupbox {
    border: solid 1px #7e7e7e;
    padding: 5px;
}
.groupbox > legend {
    width: auto !important;
    padding: 0 5px !important;
    font-size: 1em !important;
}
</style>