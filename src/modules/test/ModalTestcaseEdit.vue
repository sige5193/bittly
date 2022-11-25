<template>
  <a-modal 
    ref="modalEdit"
    v-if="enable" 
    :visible="enable" 
    :title="$t('test.editModal.title')" 
    :width="800"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <!-- title -->
      <a-input ref="inputTitle" v-model="testcase.title" :placeholder="$t('test.editModal.titlePlaceholder')"/>

      <a-tabs v-model="activeTab" class="mt-3">
        <!-- request parameter -->
        <a-tab-pane key="request-param" :tab="$t('test.requestParams')">
          <template v-if="'none' === testcase.paramFormat">
            <a-empty :description="$t('directive.parameter.none.notRequired')" />
          </template>
          <template v-else>
            <a-input-group compact style="width:300px;">
              <a-input class="w-50 text-body" :value="$t('test.parameterFormat')" disabled />
              <a-select class="w-50"
                v-model="testcase.paramFormat" 
                @change="actionHandleParamFormatChange"
               >
                <a-select-option 
                  v-for="(item,index) in $dict.items('DIRECTIVE_PARAM_FORMAT')"
                  :key="index" 
                  :value="item.value"
                  :disabled="'form' == item.value && 'form' != directive.requestFormat"
                >{{$t(`directive.parameter.${item.value}.name`)}}</a-select-option>
              </a-select>
            </a-input-group>
            <div class="mt-2">
              <component
                :is="`request-param-editor-${testcase.paramFormat}`"
                :directive="directive"
                v-model="testcase.params.value"
              ></component>
            </div>
          </template>
        </a-tab-pane>
        
        <!-- response editor -->
        <a-tab-pane key="expect-response" :tab="$t('test.expectResponseContent')">
          <a-input-group compact style="width:300px;">
            <a-input class="w-50 text-body" :value="$t('test.responseFormat')" disabled />
            <a-select class="w-50"
              v-model="testcase.expectFormat"
              @change="actionExpectFormatChange"
            >
              <a-select-option 
                v-for="(item,index) in $dict.items('DIRECTIVE_PARAM_FORMAT')"
                :key="index" 
                :value="item.value"
                :disabled="('form' == item.value && !expectFormatFormEnabled) || 'file' == item.value"
              >{{$t(`directive.parameter.${item.value}.name`)}}</a-select-option>
            </a-select>
          </a-input-group>
          <div class="mt-2">
            <request-param-editor-text 
              v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT', testcase.expectFormat)"
              v-model="testcase.expect.value"
            ></request-param-editor-text>
            <request-param-editor-hex 
              v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','HEX', testcase.expectFormat)"
              v-model="testcase.expect.value"
            ></request-param-editor-hex>
            <response-param-editor-form
              v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM', testcase.expectFormat)"
              :directive="directive"
              v-model="testcase.expect.value"
            ></response-param-editor-form>
          </div>
        </a-tab-pane>

        <!-- before script -->
        <a-tab-pane key="before-script" :tab="$t('test.beforeScript')">
          <codemirror 
            ref="editorBeforeScript" 
            :options="scriptEditorOptions" 
            v-model="testcase.beforeScript"
            @input="actionScriptEditorInput('editorBeforeScript')"
          ></codemirror>
        </a-tab-pane>

        <!-- after script -->
        <a-tab-pane key="after-script" :tab="$t('test.afterScript')">
          <codemirror 
            ref="editorAfterScript" 
            :options="scriptEditorOptions" 
            v-model="testcase.afterScript"
            @input="actionScriptEditorInput('editorAfterScript')"
          ></codemirror>
        </a-tab-pane>

        <!-- options -->
        <a-tab-pane key="config" :tab="$t('test.editModal.settings')">
          <a-form-item :label="$t('test.timeout')" labelAlign="left">
            <a-input-number class="w-100" type="number" v-model="testcase.timeout"/>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
    
    <template slot="footer">
      <a-row>
        <a-col :span="12" class="text-left">
          <a-button v-if="'before-script' == activeTab || 'after-script' == activeTab"
            type="link" class="pl-1" 
            @click="actionOpenScriptHelpLink"
          >{{$t('directive.script.helpLink')}}</a-button>
        </a-col>
        <a-col :span="12">
          <a-button @click="actionCancelModal">{{$t('button.cancel')}}</a-button>
          <a-button ref="btnOk" type="primary" @click="actionSave">{{$t('button.save')}}</a-button>
        </a-col>
      </a-row>
    </template>

  </a-modal>
</template>
<script>
import TestcaseLibBittly from './TestcaseLibBittly.js'
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/ambiance.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/lua/lua");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint");
import MdbTestcase from '../../models/MdbTestcase';
import RequestParamStringEditor from '../directive/parameters/text/ValueEditor.vue'
import RequestParamHexEditor from '../directive/parameters/hex/ValueEditor.vue'
import RequestParamEditorForm from '../directive/parameters/form/ValueEditor.vue'
import RequestParamEditorFile from '../directive/parameters/file/ValueEditor.vue'
import ResponseParamEditorForm from './ResponseParamEditorForm.vue'
export default {
    name : 'ModalTestcaseEdit',
    components : {
        'request-param-editor-text' : RequestParamStringEditor,
        'request-param-editor-hex' : RequestParamHexEditor,
        'request-param-editor-form' : RequestParamEditorForm,
        'request-param-editor-file' : RequestParamEditorFile,
        'response-param-editor-form' : ResponseParamEditorForm,
        'codemirror' : codemirror,
    },
    data() {
        return {
            enable: false,
            directive : null,
            testcase : null,
            activeTab : 'request-param',
            expectFormatFormEnabled : false,
            actResolve : null,
            actReject : null,
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
        };
    },
    methods : {
        /**
         * open modal
         * @param {MdbDirective} directive
         * @param {MdbTestcase|undefined} testcase
         * @returns {Promise}
         */
        open( directive, testcase ) {
            this.directive = directive;
            this.testcase = testcase;
            if ( undefined == testcase ) {
                this.testcase = new MdbTestcase();
                this.testcase.projectId = this.directive.projectId;
                this.testcase.title = this.$t('test.editModal.titleDefault',[
                    this.directive.name, 
                    (new Date()).getTime()
                ]);
                this.testcase.paramFormat = this.directive.requestFormat;
            }

            this.expectFormatFormEnabled = undefined != this.directive.responseFormatter.fields;
            if ( this.expectFormatFormEnabled && this.testcase.isNew ) {
                this.testcase.expectFormat = this.$dict.value('DIRECTIVE_PARAM_FORMAT','FORM');
            }

            window.bittly = new TestcaseLibBittly({
                projectId : this.$store.getters.projectActivedId
            });
            this.enable = true;
            let $this = this;
            this.$nextTick(function() {
                $this.$forceUpdate();
            });
            return new Promise(function( resolve, reject ) {
                $this.actResolve = resolve;
                $this.actReject = reject;
            });
        },

        /**
         * open help link
         */
        actionOpenScriptHelpLink() {
            window.shell.openExternal("https://bittly.sigechen.com/manual/test-testcase-script?src=bittly");
        },

        /**
         * event handler on parameter format change
         */
        actionHandleParamFormatChange() {
            this.testcase.params.value = null;
            this.$forceUpdate();
        },

        /**
         * event handler on response format change
         */
        actionExpectFormatChange() {
            this.testcase.expect.value = null;
            this.$forceUpdate();
        },

        /**
         * save testcase
         */
        async actionSave() {
            this.testcase.directiveId = this.directive.id;
            if ( ! await this.testcase.save() ) {
                this.$message.error(this.$t('test.editModal.testcaseSaveFailed'));
                return;
            }
            
            this.enable = false;
            this.$message.success(this.$t('test.editModal.testcaseSaveSuccessed'));
            this.actResolve(this.testcase);
        },

        /**
         * cancel edit model
         */
        actionCancelModal() {
            this.enable = false;
            this.actReject();
        },

        /**
         * event handler on script editor input
         */
        actionScriptEditorInput( editor ) {
            let codemirror = this.$refs[editor].codemirror;
            let cursor = codemirror.getCursor();
            let token = codemirror.getTokenAt(cursor);
            if ( token.string.match(/^[a-zA-Z0-9\\.\\$]+?$/) ) {
                codemirror.showHint();
            }
        },
    },
}
</script>