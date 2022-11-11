<!--
 - table draggable wrapper to make ant design table row draggable
-->
<template>
  <Draggable 
    ref="draggable"
    ghostClass="ghost" 
    tag="tbody" 
    handle=".drag-handler" 
    :list="tableDraggableWrapperSource[tableDraggableWrapperAttrName]" 
    @change="actionDraggableChange"
  ><slot></slot></Draggable>
</template>
<script>
import Draggable from "vuedraggable";
export default {
    name : 'TableDraggableWrapper',
    components: {
        Draggable
    },
    inject : [
        'tableDraggableWrapperSource',
        'tableDraggableWrapperAttrName'
    ],
    methods : {
        /**
         * event handler on draggable changed
         * @param {Object} event
         */
        actionDraggableChange( event ) {
            this.tableDraggableWrapperSource.handleTableDraggableWrapperChanged(event);
        },
    },
}
</script>
<style>
.ghost { opacity: 0.5; background: #c8ebfb;}
</style>