<template>
  <a-modal ref="modalEditor"
    v-if="visible" 
    :visible="visible"
    :closable="false"
    :width="900" 
    :title="$t('directive.script.configTitle')" 
  >
    <a-row>
      <!-- editor -->
      <a-col :span="18">
        <div id="directive-script-code-editor">
          <codemirror 
            ref="editorScript" 
            :options="requestScriptEditorOptions" 
            v-model="requestScript"
            @input="actionRequestScriptEditorInput"
          ></codemirror>
        </div>
      </a-col>
      
      <!-- snippets -->
      <a-col :span="6" class="pl-1">
        <a-button v-for="(snippet,snippetKey) in customScriptSnippets" :key="snippetKey"
          ref="btnSnippet" type="link" block size="small" class="text-small text-left" 
          @click="actionInsertSnippets(snippetKey)"
        >{{$t(`directive.script.${snippet.name}`)}}</a-button>
      </a-col>
    </a-row>
    
    <template slot="footer">
      <a-row>
        <a-col :span="12" class="text-left">
          <a-button ref="btnHelp" type="link" class="pl-1" @click="actionOpenHelpLink">{{$t('directive.script.helpLink')}}</a-button>
        </a-col>
        <a-col :span="12">
          <a-button ref="btnOk" type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/darcula.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/lua/lua");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint")
import ScriptRuntime from './Runtime.js'
import ScriptLib from './Bittly.js'
import Executor from './Executor.js';
import FormScriptParameterHandler from '../parameters/form/ScriptParameterHandler.js';
export default {
    components : {
        codemirror,
    },
    data() {
        return {
            visible : false,
            actResolve : null,
            actReject : null,
            
            directive : null,
            
            requestScript : '',
            requestScriptEditorOptions : {
                mode:'javascript',
                theme: 'darcula',
                readOnly:false,
                lineNumbers:true,
                lineWrapping:true,
                autofocus:true,
                indentWithTabs: true,
                indentUnit : 4,
                hintOptions : {
                    completeSingle: false,
                },
            },
            customScriptSnippets : require('./Snippets.js'),
        };
    },
    methods : {
        /**
         * open script editor modal
         * @param {MdbDirective} directive
         * @returns {Promise}
         */
        open ( directive ) {
            let $this = this;

            // set up input suggestions
            let runtime = new ScriptRuntime(this.directive);
            if ( 'form' === directive.requestFormat ) {
                runtime.parameter = new FormScriptParameterHandler();
            }
            window.$this = runtime;
            
            window.bittly = new ScriptLib(this.directive);
            window.project = {};
            Executor.getProjectScriptObjectOfCurrentProject().then( project => {
                window.project = project;
            }).catch(e => {
                $this.$message.error(e.message);
            });

            return new Promise(( resolve, reject ) => {
                $this.directive = directive;
                $this.actResolve = resolve;
                $this.actReject = reject;
                $this.visible = true;
                $this.requestScript = $this.directive.requestScript;
            });
        },

        /**
         * event handler for editor input event to show suggest list.
         */
        actionRequestScriptEditorInput() {
            let codemirror = this.$refs.editorScript.codemirror;
            let cursor = codemirror.getCursor();
            let token = codemirror.getTokenAt(cursor);
            if ( token.string.match(/^[a-zA-Z0-9\\.\\$]+?$/) ) {
                codemirror.showHint();
            }
        },

        /**
         * insert snippets to custom editor by given name
         * @param {String} name
         */
        actionInsertSnippets( name ) {
            let cm = this.$refs.editorScript.codemirror;
            let doc = cm.getDoc();
            let cursor = doc.getCursor();
            let line = doc.getLine(cursor.line);
            let pos = {
                line: cursor.line
            };
            
            let text = this.customScriptSnippets[name].template;
            if ( 0 === line.length ) {
                doc.replaceRange(text, pos);
            } else {
                doc.replaceRange("\n" + text, pos);
            }
        },

        /**
         * done editting
         */
        actionOk() {
            if ( this.directive.requestScript != this.requestScript ) {
                this.directive.requestScript = this.requestScript;
            }
            this.visible = false;
            this.actResolve();
        },

        /**
         * open help link
         */
        actionOpenHelpLink() {
            this.$env.browserOpen("https://bittly.sigechen.com/manual/directive-script?src=bittly");
        },
    },
}
</script>
<style>
#directive-script-code-editor .CodeMirror { height: 500px !important;}
#directive-script-code-editor .CodeMirror-hints {z-index: 99999 !important;}
</style>