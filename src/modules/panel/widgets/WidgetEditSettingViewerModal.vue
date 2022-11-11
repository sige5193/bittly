<template>
  <a-modal ref="settingModal" v-if="enable" :visible="enable"
    :title="$t('panel.editMode.widgetSettingTitle')" 
    :width="600"
    @cancel="actionSettingOk" 
  >
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
        <!-- custom config items -->
        <slot></slot>
        
        <!-- size of widget -->
        <template v-if="resizable">
          <a-form-item :label="$t('panel.widgetResize')">
            <a-row>
              <a-col :span="12" class="pr-1">
                <a-input-group compact>
                  <a-input class="text-body w-50" :value="$t('panel.widgetResizeHeight')" disabled/>
                  <a-input-number ref="inputSizeHeight" class="w-50" v-model="widget.sizeHeight" :min="0" 
                    @change="actionForceUpdate"
                  />
                </a-input-group>
              </a-col>
              <a-col :span="12">
                <a-input-group compact>
                  <a-input class="text-body w-50" :value="$t('panel.widgetResizeWidth')" disabled/>
                  <a-input-number ref="inputSizeWidth" class="w-50" v-model="widget.sizeWidth" :min="0" 
                    @change="actionForceUpdate"/>
                </a-input-group>
              </a-col>
            </a-row>
          </a-form-item>
        </template>

        <!-- Tooltip -->
        <a-form-item v-if="tooltipAvailable" :label="$t('panel.widgetTooltip')">
          <a-input ref="inputTooltip" v-model="widget.tooltip" @input="actionForceUpdate"/>
        </a-form-item>

        <!-- data source -->
        <a-form-item v-if="Array.isArray(dataSources)" 
          :label="$t('panel.editMode.widgetSettingDataSource')"
          :class="'script' == widget.dataSource ? 'mb-0' : ''"
        >
          <a-radio-group ref="radioGroupDataSource" v-model="widget.dataSource" @change="actionForceUpdate">
            <a-radio 
              v-for="dataSource in dataSources" 
              :key="dataSource" 
              :value="dataSource" 
              :ref="`radioWidgetDataSources`"
            >{{$t(`panel.editMode.widgetSettingDataSource${dataSource[0].toUpperCase() + dataSource.substr(1)}`)}}</a-radio>
          </a-radio-group>
          
          <!--- code snippets -->
          <div class="w-50 d-inline-block" v-if="'script' == widget.dataSource">
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
            <a-button ref="btnHelpLink" class="text-body ml-2" type="link" 
              @click="actionOpenScriptHelpLink"
            >{{$t('directive.script.helpLink')}}</a-button>
          </div>
        </a-form-item>

        <!-- data source : variable  -->
        <template v-if="'variable' == widget.dataSource">
          <a-form-item v-for="(dataSourceVarItem, dataSourceVarIndex) in dataSourceVars"
            :key="dataSourceVarIndex" :label="dataSourceVarItem.label"
          >
            <variable-selector ref="variableSelector" v-model="widget[dataSourceVarItem.name]"
              :panel="panel" @change="actionForceUpdate"
            />
          </a-form-item>
        </template>

        <!-- data source : expression  -->
        <template v-if="'expression' == widget.dataSource">
          <a-form-item v-for="(dataSourceExprItem, dataSourceExprIndex) in dataSourceExprs"
            :key="dataSourceExprIndex" :label="dataSourceExprItem.label"
          >
            <a-input v-model="widget[dataSourceExprItem.name]"
              :placeholder="'10 * {{variable}} * 100 / 3'"
              @change="actionForceUpdate"
            />
          </a-form-item>
        </template>

        <!-- data source : script -->
        <template v-if="'script' == widget.dataSource">
          <a-form-item :wrapperCol="{span: 24}">
            <div style="height:300px;">
              <code-editor ref="actionCodeEditor" v-model="widget.dataSourceScript" />
            </div>
          </a-form-item>
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
import MyObject from '../../../utils/datatype/MyObject'
export default {
    name : 'EditModalWidgetSetting',
    components : {
        'variable-selector' : VariableSelector,
        'param-value-editor-text' : DirectiveParamValueEditorString,
        'param-value-editor-hex' : DirectiveParamValueEditorHex,
        'param-value-editor-form' : DirectiveParamValueEditorForm,
        'code-editor' : CodeEditor,
    },
    props : {
        /**
         * widget object
         * @property {Object}
         */
        widget : {type:Object,required:true},
        /**
         * instance of panel
         * @property {MdbPanel}
         */
        panel : {type:Object,required:true},
        /**
         * name of data source
         * @property {String|String[]|null}
         */
        dataSources : {type:[String, Array], default:null},
        /**
         * variable map from runtime variable to widget variable
         * @property {Array}
         */
        dataSourceVars : {type:Array, default:null },
        /**
         * expressions map for widget variables
         */
        dataSourceExprs : {type:Array, default:()=>[]},
        /***
         * is widget able to resize 
         * @property {Boolean}
         */
        resizable : { type : Boolean, default : false },
        /**
         * enable tooltip or not
         * @property {Boolean}
         */
        tooltipAvailable : { type : Boolean, default : true },
    },
    data() {
        return {
            /**
             * enable modal or not
             */
            enable : false,
            /**
             * @property {Object}
             */
            widgetOld : null,
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
         */
        open() {
            return new Promise(resolve => this.setup(resolve));
        },

        /**
         * init modal
         */
        async setup ( resolve ) {
            this.resolveCallback = resolve;
            this.widgetOld = MyObject.copy(this.widget);

            if ( null != this.dataSources && undefined == this.widget.dataSource ) {
                this.widget.dataSource = 'variable';
            }

            window.bittly = new WidgetActionScriptBittly({runtime : null});
            window.$this = {valueGet:null,dataSet:null};
            this.enable = true;
            this.$forceUpdate();
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

        /**
         * open help link
         */
        actionOpenScriptHelpLink() {
            window.shell.openExternal("https://bittly.sigechen.com/manual/panel-widgets-script?src=bittly");
        },
    },
}
</script>
<style>
.CodeMirror-hints {z-index: 99999 !important;}
</style>