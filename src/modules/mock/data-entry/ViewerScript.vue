<template>
  <div class="content">
    <pre class="mb-0">{{viewerContent}}</pre>
  </div>
</template>
<script>
import ViewerBase from './ViewerBase.js'
export default {
    /**
     * @property {Array<Object>}
     */
    mixins : [ViewerBase],
}
</script>