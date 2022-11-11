<template>
  <div class="h-100 p-1">
    <a-empty ref="empty" :description="$t('directive.parameter.none.notRequired')" />
  </div>
</template>
<script>
export default {
    name : 'DirectiveParamEditorNone',
}
</script>