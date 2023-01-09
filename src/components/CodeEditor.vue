<template>
  <div class="code-editor">
    <codemirror 
      ref="editor" 
      v-model="content"
      :options="options" 
      @input="actionInput"
      @ready="actionReday"
    ></codemirror>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/darcula.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint")
export default {
    name : 'CodeEditor',
    components : {
        'codemirror' : codemirror,
    },
    props : {
        /**
         * @property {String}
         */
        value : {type:String, default:''},
        /**
         * @property {Boolean}
         */
        readonly : {type:Boolean,default:false},
        /**
         * @property {String}
         */
        mode : {type:String, default:'javascript'},
        /**
         * @property {Boolean}
         */
        lineNumbers : {type:Boolean, default:false},
    },
    data() {
        return {
            content : '',
            options : {
                mode:this.mode,
                theme: 'darcula',
                readOnly:this.readonly,
                cursorBlinkRate: this.readonly ? -1 : 530,
                lineNumbers:this.lineNumbers,
                lineWrapping:true,
                autofocus:true,
                indentWithTabs: true,
                indentUnit : 4,
                hintOptions : {
                    completeSingle: false,
                },
            },
        }
    },
    watch : {
        value() {
            this.content = this.value
        },
    },
    created() {
        this.content = this.value;
    },
    methods : {
        /**
         * 
         */
        actionReday() {
            let codemirror = this.$refs.editor.codemirror;
            codemirror.on("gutterClick", (cm,line,gutter,clickEvent) => this.$emit('gutter-click',cm,line,gutter,clickEvent));
        },

        /**
         * event handler on editor input event
         */
        actionInput() {
            this.$emit('input', this.content);
            this.$emit('change');
            
            if ( 'javascript' === this.mode ) {
                let codemirror = this.$refs.editor.codemirror;
                let cursor = codemirror.getCursor();
                let token = codemirror.getTokenAt(cursor);
                if ( token.string.match(/^[a-zA-Z0-9\\.\\$]+?$/) ) {
                    codemirror.showHint();
                }
            }
        },

        /**
         * insert snippet code
         * @public
         * @param {String} content
         */
        insertSnippet( content ) {
            let cm = this.$refs.editor.codemirror;
            let doc = cm.getDoc();
            let cursor = doc.getCursor();
            let line = doc.getLine(cursor.line);
            let pos = { line: cursor.line };
            if ( 0 === line.length ) {
                doc.replaceRange(content, pos);
            } else {
                doc.replaceRange("\n" + content, pos);
            }
        },
    },
}
</script>
<style>
.code-editor {height: 100%;}
.code-editor .vue-codemirror {height: 100%;}
.code-editor .vue-codemirror .CodeMirror {height: 100%;}
.code-editor .CodeMirror-line {line-height: initial !important;}
.code-editor .cm-s-darcula span.cm-comment {font-style: normal !important;}
</style>