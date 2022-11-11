<template>
  <div class="h-100 border rounded">
    <a-dropdown :trigger="['contextmenu']">
      <codemirror 
        class="directive-parameter-editor-text-content h-100"
        ref="editor" 
        v-model="content"
        :options="editorOptions" 
        @input="actionTextareaInput"
      ></codemirror>
      <a-menu slot="overlay" @click="actionEditorContextMenuClicked">
        <a-menu-item key="ModeText">{{$t('directive.parameter.text.modeText')}}</a-menu-item>
        <a-menu-item key="ModeJson">{{$t('directive.parameter.text.modeJson')}}</a-menu-item>
        <a-menu-item key="ModeXml">{{$t('directive.parameter.text.modeXml')}}</a-menu-item>
      </a-menu>
    </a-dropdown>
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
    name : 'DirectiveParamEditorStringBlock',
    components : {
        codemirror
    },
    props : {
        /**
         * @property {MdbDirective}
         */
        value:{}
    },
    data() {
        return {
            directive : null,
            content : null,
            contentOld : null,
            editorOptions : {
                mode:'text',
                theme: 'default',
                lineNumbers:true,
                foldGutter: true,
                lineWrapping: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
            },
        };
    },
    mounted() {
        this.initVModel();
    },
    methods: {
        /**
         * init v-model
         */
        initVModel() {
            this.directive = this.value;
            this.content = '';
            if ( undefined != this.directive.requestContent.text ) {
                this.content = this.directive.requestContent.text;
            }
            this.contentOld = this.content;
        },

        /**
         * event handler on user click menu item of editor context menu.
         * @param {Event} event
         */
        actionEditorContextMenuClicked( event ) {
            switch ( event.key ) {
            case 'ModeText' : this.editorOptions.mode = 'text'; break;
            case 'ModeJson' : 
                this.editorOptions.mode = 'javascript'; 
                try {
                    let json = JSON.stringify(JSON.parse(this.content), null, 4);
                    this.content = json;
                } catch {}
                this.actionTextareaInput();
                break;
            case 'ModeXml' : this.editorOptions.mode = 'xml'; break;
            }
        },

        /**
         * update v-model after each input
         */
        actionTextareaInput() {
            if ( this.content == this.contentOld ) {
                return ;
            }

            this.directive.requestContent.text = this.content;
            this.directive.requestContent = Common.objCopy(this.directive.requestContent);
            this.$emit('input', this.directive);
            this.contentOld = this.content;
        },
    },
}
</script>
<style>
.directive-parameter-editor-text-content .CodeMirror {height:100%;}
</style>