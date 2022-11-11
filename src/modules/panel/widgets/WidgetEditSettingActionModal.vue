<template>
  <a-modal ref="settingModal" v-if="enable" :visible="enable"
    :title="$t('panel.editMode.widgetSettingTitle')" 
    :width="600"
    @cancel="actionSettingOk"
  >
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <!-- custom config items -->
      <slot></slot>
        
      <!-- Tooltip -->
      <a-form-item v-if="tooltipAvailable" :label="$t('panel.widgetTooltip')">
        <a-input ref="inputTooltip" v-model="widget.tooltip" @input="actionForceUpdate"/>
      </a-form-item>

      <!-- actions -->
      <a-form-item v-if="Array.isArray(actions)" :label="$t('panel.editMode.widgetSettingAction')" class="mb-1">
        <a-radio-group ref="radioGroupAction" v-model="widget.action" @change="actionForceUpdate">
          <a-radio v-for="action in actions" :key="action" :value="action" :ref="`radioWidgetActioins`">
            {{$t(`panel.editMode.widgetSettingAction${action[0].toUpperCase() + action.substr(1)}`)}}
          </a-radio>
        </a-radio-group>
          
        <!-- script snippets -->
        <div class="d-inline-block" v-if="'script' == widget.action">
          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link text-muted" @click="e => e.preventDefault()">
              <span>{{$t('panel.editMode.widgetSettingScriptSnippet')}} <a-icon type="right-circle" /> </span>
            </a>
            <a-menu slot="overlay" @click="actionScriptSnippetClick">
              <a-menu-item v-for="(scriptSnippet,scriptSnippetKey) in scriptSnippets" :key="scriptSnippetKey">
                <a href="javascript:;">{{$t(`panel.editMode.widgetSettingScriptSnippet${scriptSnippet.name}`)}}</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
          <a-button ref="btnScriptHelp" class="text-body ml-2" type="link" 
            @click="actionOpenScriptHelpLink"
          >{{$t('directive.script.helpLink')}}</a-button>
        </div>
      </a-form-item>
      
      <template v-if="'variable' == widget.action">
        <!-- set value to variable -->
        <a-form-item :label="$t('panel.editMode.widgetSettingViewerVariable')">
          <variable-selector ref="variableSelector" v-model="widget.targetVariable" 
            :panel="panel" @change="actionForceUpdate" 
          />
        </a-form-item>
      </template>

      <template v-if="'script' == widget.action">
        <!-- execute script -->
        <a-form-item :wrapperCol="{span: 24}">
          <div style="height:300px;">
            <code-editor ref="actionCodeEditor" v-model="widget.actionScript" />
          </div>
        </a-form-item>
      </template>

      <template v-if="'directive' == widget.action">
        <!-- execute directive -->
        <a-form-item :label="$t('panel.editMode.widgetSettingBindDirective')">
          <directive-tree-select ref="directiveTreeSelect"
            v-model="widget.directiveId"
            @select="actionDirectiveTreeSelectSelect"
          ></directive-tree-select>
        </a-form-item>
        
        <template v-if="null != directive">
          <!-- directive param editor -->
          <a-form-item v-if="'none' !== directive.requestFormat" :label="$t('panel.editMode.widgetSettingRequestParams')">
            <a-radio-group ref="radioGroupDirectiveParamFormat" button-style="solid" 
              v-model="widget.directiveParamFormat" @change="actionParamFormatChange"
            >
              <a-radio-button v-for="(item, index) in $dict.items('DIRECTIVE_PARAM_FORMAT')" 
                :key="index" :value="item.value" :disabled="'FORM' === item.key && 'form' != directive.requestFormat"
              >{{$t(`directive.parameter.${item.value}.name`)}}</a-radio-button>
            </a-radio-group>
            <component v-if="'none' != widget.directiveParamFormat" 
              ref="comDirectiveParamEditor"
              v-model="widget.directiveParams"
              :is="`param-value-editor-${widget.directiveParamFormat}`"
              :directive="directive"
              :quickInput="parameterQuickInput"
            ></component>
          </a-form-item>
          
          <!-- directive response handler config -->
          <a-form-item :label="$t('panel.editMode.widgetSettingResponseToVariable')">
            <a-radio-group button-style="solid" ref="radioGroupDirectiveResponseParser"
              v-model="widget.directiveResponseParser" @change="actionResponseFormatChange"
            >
              <a-radio-button value="none">{{$t('panel.editMode.widgetSettingResponseParserNone')}}</a-radio-button>
              <a-radio-button value="raw">{{$t('panel.editMode.widgetSettingResponseParserRaw')}}</a-radio-button>
              <a-radio-button value="form">{{$t('panel.editMode.widgetSettingResponseParserForm')}}</a-radio-button>
              <a-radio-button value="json">{{$t('panel.editMode.widgetSettingResponseParserJson')}}</a-radio-button>
            </a-radio-group>
            
            <!-- directive response parser : raw -->
            <div v-if="'raw' == widget.directiveResponseParser">
              <variable-selector :panel="panel" v-model="widget.directiveResponseVariable"/>
            </div>

            <!-- directive response parser : form -->
            <div v-if="'form' == widget.directiveResponseParser">
              <a-input-group v-for="(item, index) in widget.directiveResponseMap" 
                :key="index" compact class="w-100"
              >
                <a-input style="width: 50%" :value="item.name" disabled />
                <variable-selector ref="directiveResFormParserVariableSelector" class="w-50" 
                  v-model="widget.directiveResponseMap[index].variable" :panel="panel"
                  @change="actionForceUpdate"
                />
              </a-input-group>
            </div>
            
            <!-- response parser json map -->
            <div v-if="'json' == widget.directiveResponseParser">
              <div v-for="(item,index) in widget.directiveResponseJsonMap" :key="index" class="d-flex flex-dir-row mb-1">
                <a-input v-model="widget.directiveResponseJsonMap[index].expression" ref="directiveResJsonParserMapExpr" 
                  class="rounded-right-none" placeholder="data.order.id" @change="actionForceUpdate"
                />
                <variable-selector ref="directiveResJsonParserMapVariable"  class="d-inline-flex rounded-none" 
                  v-model="widget.directiveResponseJsonMap[index].variable" :panel="panel"
                  @change="actionForceUpdate"
                />
                <a-button ref="directiveResJsonParserMapDelete" class="rounded-left-none" 
                  @click="actionDirectiveResponseJsonMapRemove(index)"
                ><a-icon type="delete" /></a-button>
              </div>
              <a-button ref="btnDirectiveResJsonParserMapAdd" @click="actionDirectiveResponseJsonMapAdd"><a-icon type="plus" /></a-button>
            </div>
          </a-form-item>
        </template>
      </template>
    </a-form>

    <template slot="footer">
      <a-button ref="btnOk" type="primary" @click="actionSettingOk">{{$t('button.ok')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import CodeEditor from '../../../components/CodeEditor.vue'
import VariableSelector from '../variable/Selector.vue'
import WidgetActionScriptBittly from './WidgetActionScriptBittly.js'
import DirectiveParamValueEditorString from '../../directive/parameters/text/ValueEditor.vue'
import DirectiveParamValueEditorHex from '../../directive/parameters/hex/ValueEditor.vue'
import DirectiveParamValueEditorForm from '../../directive/parameters/form/ValueEditor.vue'
import DirectiveParamValueEditorFile from '../../directive/parameters/file/ValueEditor.vue'
import MdbDirective from '../../../models/MdbDirective.js'
import DirectiveTreeSelect from '../../directive/entry/DirectiveTreeSelect.vue'
import MyObject from '../../../utils/datatype/MyObject'
export default {
    name : 'EditModalWidgetSetting',
    components : {
        'variable-selector' : VariableSelector,
        'directive-tree-select' : DirectiveTreeSelect,
        'param-value-editor-text' : DirectiveParamValueEditorString,
        'param-value-editor-hex' : DirectiveParamValueEditorHex,
        'param-value-editor-form' : DirectiveParamValueEditorForm,
        'param-value-editor-file' : DirectiveParamValueEditorFile,
        'code-editor' : CodeEditor,
    },
    props : {
        /**
         * action names ：variable，directive
         * @exampl actions="null"
         * @exampl actions="'variable'"
         * @exampl actions="['variable','directive']"
         */
        actions : { type : [String, Array], default : null },
        /**
         * default action name
         * @example defaultAction="'variable'"
         */
        defaultAction : { type : String, default : null, },
        /**
         * widget object
         * @property {Object}
         */
        widget : Object,
        /**
         * panel instance
         * @property {MdbPanel}
         */
        panel : Object,
        /**
         * enable tooltip editor
         */
        tooltipAvailable : { type : Boolean, default : true },
    },
    data() {
        return {
            /**
             * display modal or not
             */
            enable : false,
            /**
             * @property {Object}
             */
            widgetOld : null,
            /**
             * @property {MdbDirective}
             */
            directive : null,
            /**
             * quick input for parameters
             * @property {Array<Object>|null}
             */
            parameterQuickInput : null,
            /**
             * script snippet list.
             * @property {Array<Object>}
             */
            scriptSnippets : require('./WidgetActionScriptSnippets.js'),
            /**
             * @property {Function|null}
             */
            resolveCallback : null,
        };
    },
    methods : {
        /**
         * open setting modal
         * @public
         */
        open() {
            return new Promise(resolve => this.setup(resolve));
        },

        /**
         * setup setting modal
         */
        async setup( resolve ) {
            this.resolveCallback = resolve;
            this.widgetOld = MyObject.copy(this.widget);

            // init parameter quick input
            this.parameterQuickInput = [];
            for ( let i=0; i<this.panel.variables.length; i++ ) {
                let variable = this.panel.variables[i];
                this.parameterQuickInput.push({
                    label : this.$t('panel.editMode.widgetSettingRequestParamQuickInputLabel',[variable.name]),
                    value : `{{panel.${variable.name}}}`
                });
            }
            if ( 0 == this.parameterQuickInput.length ) {
                this.parameterQuickInput = null;
            }

            if ( null != this.defaultAction && undefined == this.widget.action) {
                this.widget.action = this.defaultAction;
            }
            if ( 'string' == typeof(this.actions) ) {
                this.widget.action = this.actions;
            }

            this.directive = await MdbDirective.findOne(this.widget.directiveId);
            window.bittly = new WidgetActionScriptBittly({runtime : null});
            window.$this = {valueGet : null,dataSet : null,};

            this.$forceUpdate();
            this.enable = true;
        },

        /**
         * open help link
         */
        actionOpenScriptHelpLink() {
            window.shell.openExternal("https://bittly.sigechen.com/manual/panel-widgets-script?src=bittly");
        },

        /**
         * event handler on script snippet menu item clicked.
         * @param {Object} event
         */
        actionScriptSnippetClick( event ) {
            let text = this.scriptSnippets[event.key].template;
            this.$refs.actionCodeEditor.insertSnippet(text);
        },

        /**
         * event handler on directive selected
         */
        async actionDirectiveTreeSelectSelect( directive ) {
            this.directive = directive;
            
            this.widget.directiveParamFormat = this.directive.requestFormat;
            this.actionParamFormatChange();
            this.widget.directiveResponseParser = 'none';
            this.actionResponseFormatChange();
            this.$forceUpdate();
        },

        /**
         * event handler on requests parameter format changed
         */
        actionParamFormatChange() {
            this.widget.directiveParams = '';
            if ( this.$dict.match('DIRECTIVE_PARAM_FORMAT','FORM',this.widget.directiveParamFormat) ) {
                this.widget.directiveParams = null;
            }
            this.$forceUpdate();
        },

        /**
         * event handelr on directive response format change
         */
        actionResponseFormatChange() {
            if ( 'form' === this.widget.directiveResponseParser ) {
                this.widget.directiveResponseMap = [];
                let fields = this.directive.responseFormatter.fields;
                if ( undefined !== fields ) {
                    for ( let i=0; i<fields.length; i++ ) {
                        this.widget.directiveResponseMap.push({name : fields[i].name,variable : null});
                    }
                }
            } else if ( 'json' === this.widget.directiveResponseParser ) {
                this.widget.directiveResponseJsonMap = [];
            }
            this.$forceUpdate();
        },

        /**
         * add variable map to response json map
         */
        actionDirectiveResponseJsonMapAdd() {
            this.widget.directiveResponseJsonMap.push({expression:'',variable:null});
            this.$forceUpdate();
        },

        /**
         * delete variable map from response json map
         */
        actionDirectiveResponseJsonMapRemove(index) {
            this.widget.directiveResponseJsonMap.splice(index, 1);
            this.$forceUpdate();
        },

        /**
         * done setting
         */
        actionSettingOk() {
            this.enable = false;
            let hasChanged = !MyObject.isEqual(this.widgetOld, this.widget);
            this.resolveCallback(hasChanged);
        },

        /**
         * force update
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },
    },
}
</script>