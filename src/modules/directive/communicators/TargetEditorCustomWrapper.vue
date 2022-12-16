<template>
  <component :is="`directive-target-editor-${name}`" />
</template>
<script>
export default {
    name : 'DirectiveCommunicatorTargetEditorCustomWrapper',
    props : {
        name : {type:String}
    },
}
</script>