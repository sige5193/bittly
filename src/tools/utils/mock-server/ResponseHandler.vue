<template>
  <div v-if="enable" class="border-top p-1 flex-grow-1 h-0 d-flex flex-dir-column">
    <a-row class="mb-1">
      <a-col :span="18">
        <span>{{$t('app.tool.responseHandlerOrder')}} : </span>
        <div v-for="(item, index) in handlers" :key="item.type" class="d-inline-block">
          <div :class="genHandlerItemClassName(item)">
            <span class="name" @click="actionHandlerActive(item.type)">
              <a-icon v-if="!item.enable" type="stop" />
              {{item.label}}
            </span> 
            <a-dropdown :trigger="['click']">
              <span class="menu"><a-icon type="menu" /></span>
              <a-menu slot="overlay" @click="actionHandlerMenuClick($event,index)">
                <a-menu-item key="Enable" :disabled="item.enable"><a-icon type="check-circle" /> {{$t('messages.enable')}}</a-menu-item>
                <a-menu-item key="Disable" :disabled="!item.enable"><a-icon type="stop" /> {{$t('messages.disable')}}</a-menu-item>
                <a-menu-item key="MoveForward" :disabled="0 == index"><a-icon type="vertical-right" /> {{$t('app.tool.responseHandlerMoveForward')}}</a-menu-item>
                <a-menu-item key="MoveBack" :disabled="item.length-1 == index"><a-icon type="vertical-left" /> {{$t('app.tool.responseHandlerMoveBack')}}</a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
          <a-icon v-if="index < handlers.length - 1" type="double-right" class="mr-1" />
        </div>
        <a-divider type="vertical" />
        <div class="d-inline-block">
          <div :class="'manual' == handler ? 'handle-item active' : 'handle-item'">
            <span class="name" @click="actionHandlerActive('manual')">
              {{$t('app.tool.responseHandlerManual')}}
            </span> 
            <span class="menu"><a-icon type="edit" /></span>
          </div>
        </div>


      </a-col>
      <a-col :span="6" class="text-right">
        <a-radio-group 
          v-if="-1 != ['random','manual'].indexOf(handler)"
          v-model="mode" size="small"
          @change="actionOptionChange"
        >
          <a-radio-button value="hex">HEX</a-radio-button>
          <a-radio-button value="text">TEXT</a-radio-button>
        </a-radio-group>
        <a-button v-if="'match' == handler" size="small" @click="actionMatchRuleAdd"><a-icon type="plus" /></a-button>
      </a-col>
    </a-row>
    
    <!-- manual -->
    <div v-if="'manual' == handler" class="h-0 flex-grow d-flex flex-dir-column">
      <a-textarea 
        class="flex-grow"
        ref="textareaManualContent" 
        v-model="manualContent" 
        @change="actionOptionChange" 
      />
        
      <div class="pt-1">
        <a-select v-if="'text' == mode" style="width: 120px" size="small" v-model="manualNewlineStyle" @change="actionOptionChange">
          <a-select-option value="CRLF">CRLF (\r\n)</a-select-option>
          <a-select-option value="CR">CR (\r)</a-select-option>
          <a-select-option value="LF">LF (\n)</a-select-option>
        </a-select>
        <a-button ref="btnManualSend" class="ml-1 float-right" type="primary" @click="actionManualContentSend">
          {{$t('button.send')}}
        </a-button>
      </div>
    </div>

    <!-- echo -->
    <div
      v-if="'echo' == handler"
      class="h-0 flex-grow bg-light echo-block"
    ><a-icon type="sound" /></div>

    <!-- random -->
    <a-textarea 
      v-if="'random' == handler"
      class="h-0 flex-grow"
      v-model="randomTemplate"
      @change="actionOptionChange"
    />
    
    <!-- response handler : script -->
    <codemirror 
      v-if="'script' == handler"
      class="h-0 flex-grow response-handler-script"
      ref="scriptEditor"
      v-model="script"
      :options="scriptEditorOptions" 
      @input="actionScriptEditorInput"
    ></codemirror>
    
    <!-- response match rule -->
    <a-table 
      v-if="'match' == handler"
      class="response-match-rules flex-grow h-0 overflow-auto" 
      :pagination="false"
      :columns="matchTableColumns" 
      :data-source="matchRules"
    >
      <div slot="status" slot-scope="text,record">
        <a-switch size="small" v-model="record.enable" @change="actionOptionChange"/>
      </div>
      <div slot="mode" slot-scope="text,record">
        <a-radio-group size="small" v-model="record.mode" @change="actionOptionChange">
          <a-radio-button value="text">TEXT</a-radio-button>
          <a-radio-button value="hex">HEX</a-radio-button>
        </a-radio-group>
      </div>
      <div slot="note" slot-scope="text,record">
        <a-input 
          size="small" 
          v-model="record.note" 
          :placeholder="$t('app.tool.responseHandlerMatchColNote')"
          @change="actionOptionChange"
        />
      </div>
      <div slot="template" slot-scope="text,record">
        <a-input 
          size="small" 
          v-model="record.template" 
          :placeholder="$t('messages.exampleContent',['text'==record.mode ? 'how are you ?' : '01 AA CD FF'])"
          @change="actionOptionChange"
        />
      </div>
      <match-content-editor
        slot="response" 
        slot-scope="text,record"
        v-model="record.response"
        :mode="record.mode"
        @change="actionOptionChange"
      ></match-content-editor>
      <div slot="operations" slot-scope="text,record,index">
        <a-button size="small" @click="actionMatchRowDelete(index)">
          <a-icon type="delete" />
        </a-button>
      </div>
    </a-table>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/ambiance.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/lua/lua");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint")
import Common from '../../../utils/Common.js'
import ResponseHandlerMatchContentEditor from './ResponseHandlerMatchContentEditor.vue'
import ResponseGenerator from './ResponseGenerator.js'
import ResponseScriptRuntime from './ResponseScriptRuntime.js'
export default {
    components : {
        codemirror,
        'match-content-editor' : ResponseHandlerMatchContentEditor,
    },
    props : {
        /**
         * options of tool
         * @property {Object}
         */
        toolOptions : Object,
        /**
         * enable editor or not
         */
        enable : Boolean,
        charset : String,
    },
    data() {
        return {
            /**
             * response handlers to generate response data.
             * @property {Object[]}
             */
            handlers : [],

            handler : 'manual',
            matchRules : [],
            script : '',
            randomTemplate : '',
            mode : 'text',
            manualContent : '',
            manualNewlineStyle : 'CRLF',

            scriptEditorOptions : {
                mode:'javascript',
                theme: 'ambiance',
                readOnly:false,
                lineNumbers:true,
                lineWrapping:true,
                autofocus:true,
                hintOptions : {
                    completeSingle: false,
                },
            },
            matchTableColumns : [
                {title: this.$t('app.tool.responseHandlerMatchColStatus'),scopedSlots: { customRender: 'status' }},
                {title: this.$t('app.tool.responseHandlerMatchColMode'),dataIndex: 'mode',key: 'mode',scopedSlots: { customRender: 'mode' }},
                {title: this.$t('app.tool.responseHandlerMatchColNote'),dataIndex: 'note',key: 'note',scopedSlots: { customRender: 'note' }},
                {title: this.$t('app.tool.responseHandlerMatchColTemplate'),dataIndex: 'template',key: 'template',scopedSlots: { customRender: 'template' }},
                {title: this.$t('app.tool.responseHandlerMatchColResponse'),dataIndex: 'response',key: 'response',scopedSlots: { customRender: 'response' }},
                {title: this.$t('app.tool.responseHandlerMatchColOperations'),scopedSlots: { customRender: 'operations' },align:'right'},
            ],
            
        };
    },
    created() {
        this.init();
    },
    methods : {
        /**
         * init component
         */
        init () {
            this.handlers = [
                {type : 'echo', enable:false, label:this.$t('app.tool.responseHandlerEcho')},
                {type : 'random', enable:false, label:this.$t('app.tool.responseHandlerRandom')},
                {type : 'script', enable:false, label:this.$t('app.tool.responseHandlerScript')},
                {type : 'match', enable:false, label:this.$t('app.tool.responseHandlerMatch')},
            ];

            this.options = this.toolOptions;
            this.handlers = this.options.responseHandlers || this.handlers;
            this.handler = this.options.responseHandler || 'manual';
            this.matchRules = this.options.responseMatchRules || [];
            this.script = this.options.responseScript || '';
            this.mode = this.options.responseMode || 'text';
            this.randomTemplate = this.options.responseRandomTemplate || '';
            this.manualContent = this.options.responseManualContent || '';
            this.manualNewlineStyle = this.options.responseManualNewlineStyle || 'CRLF';

            window.$this = new ResponseScriptRuntime(null, this);
        },

        /**
         * get class name of handler item
         * @returns {String}
         */
        genHandlerItemClassName( item ) {
            let classes = [];
            classes.push('handle-item');
            if ( item.type === this.handler ) {
                classes.push('active');
            }
            if ( !item.enable ) {
                classes.push('disabled');
            }
            return classes.join(' ');
        },

        /**
         * update options
         */
        updateToolOptions() {
            let newOptions = Common.objCopy(this.toolOptions);
            newOptions.responseHandlers = this.handlers;
            newOptions.responseHandler = this.handler;
            newOptions.responseMatchRules = this.matchRules;
            newOptions.responseScript = this.script;
            newOptions.responseMode = this.mode;
            newOptions.responseRandomTemplate = this.randomTemplate;
            newOptions.responseManualContent = this.manualContent;
            newOptions.responseManualNewlineStyle = this.manualNewlineStyle;
            this.$emit('tool-option-update', newOptions);
        },

        /**
         * active handler to setting up
         * @param {String} handler
         */
        actionHandlerActive( handler ) {
            this.handler = handler;
            this.updateToolOptions();
        },

        /**
         * event handler on user click setting menu item.
         * @param {Event} event
         * @param {Number} index
         */
        actionHandlerMenuClick(event, index) {
            if ( 'Enable' === event.key ) {
                this.handlers[index].enable = true;
            } else if ( 'Disable' === event.key ) {
                this.handlers[index].enable = false;
            } else if ( 'MoveForward' === event.key ) {
                let temp = this.handlers[index-1];
                this.handlers[index-1] = this.handlers[index];
                this.handlers[index] = temp;
            } else if ( 'MoveBack' === event.key ) {
                let temp = this.handlers[index+1];
                this.handlers[index+1] = this.handlers[index];
                this.handlers[index] = temp;
            }
            this.$forceUpdate();
            this.updateToolOptions();
        },

        /**
         * set response data to response handler, and then try to generate response data 
         * to send to client.
         * @param {String} clientKey
         * @param {Buffer} data
         */
        setRequestData( clientKey, data ) {
            this.log(`[auto response] : start`);
            for ( let i=0; i<this.handlers.length; i++ ) {
                if ( ! this.handlers[i].enable ) {
                    this.log(`[auto response] : [${this.handlers[i].type}] disabled`);
                    continue;
                }
                
                let handlerName = this.handlers[i].type;
                this.log(`[auto response] : [${handlerName}] start`);
                let generator = new ResponseGenerator(this, data);
                let response = generator.generateByHandlerName(handlerName);
                if ( null === response ) {
                    continue ;
                }
                response.clientKey = clientKey;
                this.responseData(response);
            }
            this.log(`[auto response] : done`);
        },

        /**
         * @param {Object} data data options
         * - clientKey : {String}
         * - mode : {String} text|hex
         * - content : {String}
         * - note : {String}
         */
        responseData( data ) {
            this.$emit('response-generated', data);
        },

        /**
         * add new rule to match rule.
         */
        actionMatchRuleAdd() {
            this.matchRules.push({
                key:(new Date()).getTime(),
                enable:true, 
                mode:'text',
                template:'',
                response:''
            });
            this.$forceUpdate();
        },

        /**
         * delete match rule by given index
         * @param {Number} index
         */
        actionMatchRowDelete(index) {
            this.matchRules.splice(index, 1);
            this.updateToolOptions();
            this.$forceUpdate();
        },

        /**
         * trigger event on option changed
         */
        actionOptionChange() {
            this.updateToolOptions();
            this.$forceUpdate();
        },

        /**
         * show hint on script editor input.
         */
        actionScriptEditorInput() {
            let codemirror = this.$refs.scriptEditor.codemirror;
            let cursor = codemirror.getCursor();
            let token = codemirror.getTokenAt(cursor);
            if ( token.string.match(/^[a-zA-Z0-9\\.\\$]+?$/) ) {
                codemirror.showHint();
            }
            this.updateToolOptions();
        },

        /**
         * send menu contnet
         */
        actionManualContentSend() {
            let content = this.manualContent;
            if ( 'text' == this.mode ) {
                content = content.replaceAll('\r\n','\n');
                content = content.replaceAll('\r','\n');
                if ( 'CRLF' == this.manualNewlineStyle ) {
                    content = content.replaceAll('\n', '\r\n');
                } else if ( 'CR' == this.manualNewlineStyle ) {
                    content = content.replaceAll('\n', '\r');
                }
            }

            let data = {};
            data.clientKey = null;
            data.mode = this.mode;
            data.content = content;
            data.note = `${this.$t('app.tool.responseHandlerManual')}`;
            this.responseData(data);
        },

        /**
         * output log message to console.
         * @param {*} messages 
         */
        log (... messages ) {
            if ( 'test' === window.envName ) {
                return;
            }
            console.log(...messages);
        }
    }
}
</script>
<style>
.response-handler-script .CodeMirror {height: 100% !important;}
.response-match-rules th, .response-match-rules td {padding: 5px !important;}
</style>
<style scoped>
.echo-block {display: flex;flex-direction: row;font-size: 4em;align-items: center;justify-content: center;}
.handle-item {
    display:inline-block;
    cursor: pointer;
    margin-right : 0.25rem;
}
.handle-item .name {
    border: 1px solid #dee2e6;
    padding: 0 0.25rem;
    border-radius: 5px 0px 0px 5px;
    border-right: none;
}
.handle-item .menu {
    border: 1px solid #dee2e6;
    border-left: none;
    padding: 0 0.25rem;
    border-radius: 0px 5px 5px 0px;
}
.handle-item:hover {
    background: #939393;
    border-radius: 5px;
    color: white;
}
.handle-item.active {
    background: #40a9ff !important;
    border-radius: 5px;
    color: white;
    border: solid 1px #40a9ff;
}
.handle-item.disabled {
    color: #d9d9d9;
    background: #fdfdfd;
}
</style>