<template>
  <div class="border p-1 rounded viewer h-100 overflow-auto">
    <pre ref="textViewer" class="p-1 content">{{content}}</pre>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'BlockResponseViewerText',
    props: {
        directive : {},
        /**
         * the exector this directive run with
         * @property {Executor}
         */
        executor:{},
    },
    computed : {
        content() {
            if ( null == this.executor ) {
                return '';
            }
            
            let paramBuilder = this.executor.getParamBuilder();
            if ( null === paramBuilder ) {
                return '';
            }

            let buffer = paramBuilder.getRequestBuffer();
            return Common.charsetConvert(buffer, 'utf-8', this.directive.responseCharset);
        },
    },
}
</script>
<style scoped>
.viewer {min-height:100px;background-color: #e9e9e9 !important;}
.content {white-space: pre-wrap;word-wrap: break-word;}
</style>