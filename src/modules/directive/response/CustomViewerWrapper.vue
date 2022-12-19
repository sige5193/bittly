<template>
  <div class="mt-1 h-100">
    <component ref="viewer" :is="`directive-response-viewer-${name}`"/>
  </div>
</template>
<script>
export default {
    name : 'DirectiveResponseViewerCustomWrapper',
    props : {
        /**
         * @property {String}
         */
        name : {type:String},
        /**
         * @property {Object}
         */
        content : {},
    },
    watch : {
        /**
         * update content viewer on content changed
         */
        content() { this.refresh() },
    },
    methods: {
        /**
         * refresh viewer
         */
        refresh() {
            this.$refs.viewer.updateResponse(this.content);
        }
    }
}
</script>