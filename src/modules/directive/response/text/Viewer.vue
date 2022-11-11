<template>
  <div class="h-100 d-flex flex-dir-column">
    <div class="p-1 text-right bg-light rounded-top border">
      <a-radio-group ref="radioMode" size="small" v-model="mode" @change="actionViewerModeChange"> 
        <a-radio-button value="text">RAW</a-radio-button>
        <a-radio-button value="xml">XML</a-radio-button>
        <a-radio-button value="htmlmixed">HTML</a-radio-button>
        <a-radio-button value="javascript">JSON</a-radio-button>
      </a-radio-group>
    </div>
    <div class="flex-grow content border-left border-right border-bottom rounded-bottom">
      <div class="h-100">
        <codemirror 
          class="directive-response-viewer-text-content"
          ref="viewer" 
          :options="viewerOptions" 
          :value="contentData"
         ></codemirror>
      </div>
    </div>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/ambiance.css";
import 'codemirror/addon/fold/foldgutter.css'
require("codemirror/mode/htmlmixed/htmlmixed");
require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/fold/foldcode");
require("codemirror/addon/fold/foldgutter");
require("codemirror/addon/fold/brace-fold");
require("codemirror/addon/fold/comment-fold");
import Common from '@/utils/Common.js'
export default {
    name : 'BlockResponseViewerText',
    props: ['content', 'value'],
    components : {
        codemirror
    },
    data () {
        return {
            mode : 'text',
            directive : null,
            contentData : null,
            viewerOptions : {
                mode:'text',
                theme: 'default',
                readOnly:true,
                lineNumbers:true,
                foldGutter: true,
                lineWrapping: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
            },
        };
    },
    watch : {
        content() {
            this.actionViewerModeChange();
        }
    },
    created() {
        this.initVModel();
    },
    mounted() {
        this.actionViewerModeChange();
    },
    methods : {
        /**
         * init v-model
         */
        initVModel() {
            this.directive = this.value;
        },

        /**
         * view mode changed 
         */
        actionViewerModeChange() {
            this.viewerOptions.mode = this.mode;
            this.contentData = this.getContentString();
            if ( 'javascript' == this.mode ) {
                try {
                    let json = JSON.stringify( JSON.parse(this.contentData), null, 4);
                    this.contentData = json;
                } catch {}
            }
            this.$forceUpdate();
        },

        /**
         * get content string
         * @returns {String}
         */
        getContentString() {
            let content = Common.charsetConvert(
                this.content, 
                'utf-8', 
                this.directive.responseCharset
            );
            return content.toString();
        },
    },

    /**
     * generate testcase expect content from response.
     * @param {MdbDirective} directive
     * @param {Buffer} response
     * @returns {String}
     */
    generateTestcaseExpectContentFromResponse( directive, response ) {
        return Common.charsetConvert(
            response, 
            'utf-8', 
            directive.responseCharset
        ).toString();
    },
}
</script>
<style scoped>
.content {height: 0px;overflow: auto;}
</style>
<style>
.jv-container .jv-code {overflow: hidden;padding: 0px !important;}
.directive-response-viewer-text-content {height: 100%;}
.directive-response-viewer-text-content .CodeMirror {height:100%;}
</style>