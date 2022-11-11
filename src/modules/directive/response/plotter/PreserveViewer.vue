<template>
  <viewer
    ref="viewer"
    v-model="value"
    :content="content"
    :response-list="responseList"
    @input="actionDirectiveUpdate"
  ></viewer>
</template>
<script>
import { Buffer } from 'buffer';
import Viewer from './Viewer.vue'
export default {
    components : {
        'viewer' : Viewer,
    },
    props : {
        /**
         * instance of directive
         * @property {MdbDirective}
         */
        value : {},
        /**
         * list of response data.
         * @property {Array}
         */
        responseList : {},
        /**
         * instance of directive
         * @property {MdbDirective}
         */
        directive : {},
    },
    data() {
        return {
            /**
             * the content of all response
             */
            content : Buffer.from(''),
        };
    },
    watch : {
        responseList () {
            this.refreshContent();
        },
    },
    methods : {
        /**
         * refresh content from batch response list.
         */
        refreshContent() {
            if ( 0 == this.responseList.length ) {
                return;
            }

            let lastResponse = this.responseList.at(-1);
            if ( null === lastResponse.data ) {
                return;
            }
            this.content = Buffer.concat([this.content, lastResponse.data]);
        },
        
        /**
         * event handler on directive config change
         * @param {MdbDirective}
         */
        actionDirectiveUpdate(newDirective) {
            this.$emit('input', newDirective);
        },

        /**
         * export response data as excel file.
         */
        async exportAsExcel() {
            await this.$refs.viewer.exportAsExcel();
        },
    },
}
</script>