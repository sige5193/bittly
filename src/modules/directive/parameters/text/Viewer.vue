<template>
  <text-viewer
    :content="content"
    :show-blank-chars="true"
  ></text-viewer>
</template>
<script>
import Common from '@/utils/Common.js'
import TextViewer from '../../../../components/TextViewer.vue';
export default {
    name : 'DirectiveParameterTextViewer',
    components : {
        'text-viewer' : TextViewer,
    },
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

            let buffer = null;
            try {
                buffer = paramBuilder.getRequestBuffer();
            } catch {
                buffer = Buffer.alloc(0);
            }
            return Common.charsetConvert(buffer, 'utf-8', this.directive.responseCharset);
        },
    },
}
</script>
<style scoped>
.viewer {background-color: #e9e9e9 !important;}
.content {white-space: pre-wrap;word-wrap: break-word;}
</style>