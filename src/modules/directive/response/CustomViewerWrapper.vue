<template>
  <component :is="`directive-response-viewer-${name}`" />
</template>
<script>
export default {
    name : 'DirectiveResponseViewerCustomWrapper',
    props : {
        name : {type:String}
    },
}
</script>