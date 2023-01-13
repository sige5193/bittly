<template>
  <div class="content">
    <pre class="mb-0 pl-1 pr-1 white-space-pre-line word-break-all bg-white">{{generateFormValueText()}}</pre>
    <pre class="mb-0 pl-1 pr-1 mt-1 white-space-pre-line word-break-all">{{viewerContent}}</pre>
  </div>
</template>
<script>
import ViewerBase from './ViewerBase.js'
export default {
    /**
     * @property {Array<Object>}
     */
    mixins : [ViewerBase],
    methods : {
        /**
         * generatae form value text
         * @returns {String}
         */
        generateFormValueText() {
            if ( 1 == this.entry.content.length ) {
                return this.$t('mock.response.inlineEditorForm.empty');
            }

            let values = [];
            for ( let i=0; i<this.entry.content.length-1; i++ ) {
                let item = this.entry.content[i];
                values.push(`${item.name}:${item.value}`);
            }
            return values.join('; ');
        },
    }
}
</script>