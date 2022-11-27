<template>
  <div class="border p-1 rounded viewer h-100 overflow-auto">
    文件 : {{executor.getParamBuilder().paramContent.path}}
    <br>
    模式 : {{$t(`directive.parameter.file.sendMode${executor.getParamBuilder().paramContent.sendMode}`)}}
    <br>
    <pre class="mt-2 mb-2">{{content}}</pre>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'DirectiveResponseFileViewer',
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
            let buf = this.executor.getRequestBuffer();
            let content = null;
            if ( 'Line' === this.executor.getParamBuilder().paramContent.sendMode ) {
                content = Common.convertBufferToHexString(buf);
            } else {
                content = Common.charsetConvert(buf, 'utf-8', this.directive.responseCharset);
            }
            return content;
        },
    },
}
</script>
<style scoped>
.viewer {background-color: #e9e9e9 !important;}
.content {white-space: pre-wrap;word-wrap: break-word;}
</style>