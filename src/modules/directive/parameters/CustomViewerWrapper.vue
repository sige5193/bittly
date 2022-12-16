<template>
  <component :is="`directive-parameter-editor-${name}`" />
</template>
<script>
export default {
    name : 'DirectiveParameterEditorCustomWrapper',
    props : {
        name : {type:String}
    },
}
</script>