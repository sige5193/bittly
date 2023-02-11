<template>
  <parser-setting-editor ref="modalSetting" :width="900">
    <a-row>
      <!-- editor -->
      <a-col :span="18">
        <div id="plotter-parse-script-editor">
          <codemirror 
            ref="editorPlotterScript" 
            v-model="options.script"
            :options="parseScriptEditorOption"
            @input="actionEditorPlotterScriptInput"
          ></codemirror>
        </div>
        <a-button ref="btnHelpLink" type="link" size="small" class="text-muted pl-0" @click="actionOpenHelpDoc">
          <a-icon type="flag" />
          {{$t('directive.response.plotter.customScriptHelpDoc')}}
        </a-button>
      </a-col>
      
      <!-- snippets -->
      <a-col :span="6" class="pl-1" style="height:500px;overflow-y: auto;">
        <a-button v-for="(snippet, snippetName) in customScriptSnippets" :key="snippetName" 
          ref="btnSnippet"
          size="small" block type="link" class="text-left text-small" 
          @click="actionInsertSnippets(snippetName)"
        >
          {{$t(`directive.response.plotter.customScriptSnippet${snippet.title}`)}}
        </a-button>
      </a-col>
    </a-row>
  </parser-setting-editor>
</template>
<script>
import ParserMixin from './ParserMixin.js'
import Common from '../../../../../utils/Common.js'
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/darcula.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint")
import ScriptLibJavascriptBittly from '../../../script/Bittly.js'
import ChannelParserCustomScriptRuntime from './ParserScriptRuntime.js'
export default {
    name : 'DirectiveResponsePlotterParserScript',
    mixins : [ParserMixin],
    components : {codemirror},
    props : {
        /**
         * @property {Array<Buffer>}
         */
        responseList : {default:()=>[]},
    },
    data() {
        return {
            options : {},
            /**
             * config of custom parse script editor.
             * @property {Object}
             */
            parseScriptEditorOption : {
                mode:'javascript',
                theme: 'darcula',
                readOnly:false,
                lineNumbers:true,
                lineWrapping:true,
                autofocus:true,
                indentWithTabs: false,
                indentUnit : 4,
                hintOptions : {
                    completeSingle: false,
                },
            },
            customScriptSnippets : require('./ParserScriptSnippets.js'),
        };
    },
    methods : {
        /**
         * setup options by given value
         */
        setup() {
            this.options = Common.objCopy(this.value);
            this.options.script = this.value.script || '';

            // editor suggestion objects : $this & bittly
            let runtime = new ChannelParserCustomScriptRuntime();
            runtime.setData(Buffer.from('demo data'));
            window.$this = runtime;
            let bittly = new ScriptLibJavascriptBittly(this.directive);
            window.bittly = bittly;
        },

        /**
         * insert snippets to custom editor by given name
         * @param {String} name
         */
        actionInsertSnippets( name ) {
            let cm = this.$refs.editorPlotterScript.codemirror;
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
         * event handler for custom editor input
         */
        actionEditorPlotterScriptInput() {
            let codemirror = this.$refs.editorPlotterScript.codemirror;
            let cursor = codemirror.getCursor();
            let token = codemirror.getTokenAt(cursor);
            if ( token.string.match(/^[a-zA-Z0-9\\.\\$]+?$/) ) {
                codemirror.showHint();
            }
        },

        /**
         * open help link
         */
        actionOpenHelpDoc() {
            this.$env.browserOpen('https://bittly.sigechen.com/manual/directive-response-plotter-script?src=bittly');
        },

        /**
         * @see {ParserMixin.getUpdatedOptions}
         * @returns {Object}
         */
        getUpdatedOptions() {
            return this.options;
        },
        
        /**
         * parse given data content
         * @param {Uint8Array|null} content
         * @returns {Array}
         */
        parse( content ) {
            if ( null == content || 0 == this.options.script.trim().length ) {
                return 0;
            }
            
            let $this = new ChannelParserCustomScriptRuntime();
            $this.setData(content);
            let bittly = new ScriptLibJavascriptBittly(this.directive);

            try {
                let func = Function('$this', 'bittly', this.options.script);
                func.call({}, $this, bittly);
            } catch ( e ) {
                throw Error(window.app.$t('directive.response.plotter.failedToExecuteParseScript', [e.message]));
            }

            this.channelNames = $this.channelNames;
            for ( let vi=0; vi<$this.channels[0].length; vi++ ) {
                let values = [];
                for ( let ci=0; ci<$this.channels.length; ci++ ) {
                    values.push($this.channels[ci][vi]);
                }
                this.channelDataPush(values);
            }

            return $this.cursor;
        }
    }
}
</script>
<style>
#plotter-parse-script-editor .CodeMirror { height: 500px !important;}
</style>