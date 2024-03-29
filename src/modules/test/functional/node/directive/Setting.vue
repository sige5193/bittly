<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.Directive.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    :bodyStyle="{padding:0}" 
    :width="800"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <!-- directive -->
      <a-form-item labelAlign="left" class="pl-3 pr-3 pt-3 mb-0"
        :label="$t('test.functionalNode.Directive.directive')" 
      >
        <directive-tree-select ref="directiveTreeSelect"
          v-model="options.directiveId"
          @select="actionDirectiveTreeSelectSelect"
        ></directive-tree-select>
      </a-form-item>

      <a-tabs v-if="null != directive" v-model="activeTab" class="mt-1">
        <!-- request parameters -->
        <a-tab-pane key="request-param" class="pl-3 pr-3"
          :tab="$t('test.functionalNode.Directive.requestParameters')" 
          :disabled="'none' === options.parameterFormat"
        >
          <a-form-item :label="$t('test.functionalNode.Directive.inputs')" labelAlign="left" class="mb-1">
            <a-select mode="tags" v-model="options.inputs" 
              :placeholder="$t('test.functionalNode.Directive.inputParamsTip')"
              @change="actionFroceUpdate"
            ></a-select>
          </a-form-item>

          <a-form-item :label="$t('test.parameterFormat')" labelAlign="left" class="mb-0">
            <div class="d-flex">
              <a-select v-model="options.parameterFormat" @change="actionHandleParamFormatChange">
                <a-select-option value="text">{{$t(`directive.parameter.text.name`)}}</a-select-option>
                <a-select-option value="hex">{{$t(`directive.parameter.hex.name`)}}</a-select-option>
                <a-select-option value="form" :disabled="'form' != directive.requestFormat"
                >{{$t(`directive.parameter.form.name`)}}</a-select-option>
                <a-select-option value="file">{{$t(`directive.parameter.file.name`)}}</a-select-option>
              </a-select>
              <a-button class="ml-1" @click="actionParameterEditorRefresh"><a-icon type="redo" /></a-button>
            </div>
          </a-form-item>
          
          <request-param-editor-form ref="parameterEditor" 
            v-if="'form' === options.parameterFormat"
            :directive="directive" v-model="options.parameterValue"
          ></request-param-editor-form>

          <a-form-item v-else labelAlign="left" class="mb-0"
            :label="$t('test.functionalNode.Directive.parameterContent')"
          >
            <component
              :is="`request-param-editor-${options.parameterFormat}`"
              :directive="directive" v-model="options.parameterValue"
            ></component>
          </a-form-item>
        </a-tab-pane>

        <!-- response -->
        <a-tab-pane key="expect-response" :tab="$t('test.expectResponseContent')" class="pl-3 pr-3">
          <!-- response format -->
          <a-form-item :label="$t('test.responseFormat')" labelAlign="left" class="mb-0">
            <div class="d-flex">
              <a-select v-model="options.expectResponseFormat" @change="actionExpectFormatChange">
                <a-select-option value="text">{{$t(`directive.parameter.text.name`)}}</a-select-option>
                <a-select-option value="hex">{{$t(`directive.parameter.hex.name`)}}</a-select-option>
                <a-select-option value="form" :disabled="undefined == directive.responseFormatter.fields"
                >{{$t(`directive.parameter.form.name`)}}</a-select-option>
              </a-select>
              <a-button class="ml-1" @click="actionExpectResponseEditorRefresh"><a-icon type="redo" /></a-button>
            </div>
          </a-form-item>
          
          <!-- form editor -->
          <response-param-editor-form ref="responseEditor"
            v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM', options.expectResponseFormat)"
            :directive="directive"
            v-model="options.expectResponseValue"
          ></response-param-editor-form>
          
          <!-- text editor -->
          <a-form-item 
            v-else-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT', options.expectResponseFormat)" 
            :label="$t('test.expectResponseContent')" labelAlign="left" class="mb-0"
          >
            <request-param-editor-text v-model="options.expectResponseValue"
                @change="actionExpectResponseValueChange"
            />
            <a-checkbox v-model="options.expectResponseTextRegexEnable">
              {{$t('test.functionalNode.Directive.comparisonTextRegexEnable')}}
            </a-checkbox>
          </a-form-item>
          
          <!-- hex editor -->
          <a-form-item v-else :label="$t('test.expectResponseContent')" labelAlign="left" class="mb-0">
            <component :is="`request-param-editor-${options.expectResponseFormat}`"
              v-model="options.expectResponseValue"
              @change="actionExpectResponseValueChange"
            ></component>
          </a-form-item>
          
          <a-form-item :label="$t('test.functionalNode.Directive.expectDataLength')" labelAlign="left" class="mb-0">
            <a-input v-model="options.expectDataLength" @input="actionFroceUpdate"/>
          </a-form-item>

          <a-form-item :label="$t('test.functionalNode.Directive.outputs')" labelAlign="left" class="mb-0">
            <a-input :value="options.outputs.join(',')" disabled/>
          </a-form-item>
        </a-tab-pane>

        <!-- others -->
        <a-tab-pane key="config" :tab="$t('test.editModal.settings')" class="pl-3 pr-3">
          <a-form-item :label="$t('test.functionalNode.Directive.timeout')" labelAlign="left">
            <a-input-number class="w-100" type="number" v-model="options.timeout"/>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </a-modal>
</template>
<script>
import NodeDirective from './Node.js'
import DirectiveTreeSelect from '../../../../directive/entry/DirectiveTreeSelect.vue'
import RequestParamEditorForm from '../../../../directive/parameters/form/ValueEditorFormItem.vue'
import RequestParamEditorFile from '../../../../directive/parameters/file/ValueEditor.vue'
import RequestParamEditorText from '../../../../directive/parameters/text/ValueEditor.vue'
import RequestParamEditorHex from '../../../../directive/parameters/hex/ValueEditor.vue'
import ResponseParamEditorForm from '../../../DataComparationEditorForm.vue'
import MdbDirective from '../../../../../models/MdbDirective.js'
export default {
    components : {
        'directive-tree-select' : DirectiveTreeSelect,
        'request-param-editor-text' : RequestParamEditorText,
        'request-param-editor-hex' : RequestParamEditorHex,
        'request-param-editor-form' : RequestParamEditorForm,
        'request-param-editor-file' : RequestParamEditorFile,
        'response-param-editor-form' : ResponseParamEditorForm,
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            visible : false,
            /**
             * @property {Object}
             */
            options : {},
            /**
             * @property {NodeBase}
             */
            node : null,
            /**
             * @property {MdbDirective|null}
             */
            directive : null,
            /**
             * @property {String}
             */
            activeTab : 'request-param',
        };
    },
    mounted() {
        this.$parent.registerNodeAddHandler(node => this.onNodeAdded(node));
    },
    methods : {
        /**
         * callback handler on new node added.
         * @param {LGraphNode} node
         */
        onNodeAdded( node ) {
            if ( !(node instanceof NodeDirective) ) {
                return ;
            }
            node.onBtnSettingClicked = () => this.open(node);
        },

        /**
         * open setting modal
         * @param {NodeBase} node
         */
        async open(node) {
            this.node = node;
            this.options = node.getOptions();
            this.activeTab = 'request-param';
            this.directive = null;

            if ( null != this.options.directiveId ) {
                this.directive = await MdbDirective.findOne(this.options.directiveId);
            }

            this.visible = true;
            this.$forceUpdate();
        },

        /**
         * event handler on modal canceled
         */
        actionCancel() {
            this.visible = false;
        },

        /**
         * event handler on modal ok
         */
        actionOk() {
            this.node.setOptions(this.options);
            this.visible = false;
        },

        /**
         * event handle on directive selected
         * @param {MdbDirective} directive
         */
        actionDirectiveTreeSelectSelect( directive ){
            this.directive = directive;
            this.options.parameterFormat = directive.requestFormat;
            this.options.parameterValue = directive.requestContent[directive.requestFormat];
            if ( undefined === this.options.title || 0 === this.options.title.trim().length ) {
                this.options.title = directive.name;
            }

            // if no parameter required, switch tabs to response editor.
            if ( 'none' === this.options.parameterFormat ) {
                this.activeTab = 'expect-response';
            } else {
                this.activeTab = 'request-param';
            }

            this.$forceUpdate();
        },

        /**
         * event handler on parameter format change
         */
        actionHandleParamFormatChange() {
            this.options.parameterValue = null;
            this.$forceUpdate();
        },

        /**
         * event handler on response format change
         */
        actionExpectFormatChange() {
            this.options.expectResponseValue = null;
            this.options.outputs = [];
            if ( 'form' === this.options.expectResponseFormat ) {
                for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                    let item = this.directive.responseFormatter.fields[i];
                    let name = item.name;
                    if ( 0 == name.trim().length ) {
                        name = `$${i+1}`;
                    }
                    this.options.outputs.push(name);
                }
            }
            this.$forceUpdate();
        },

        /**
         * event handler on expect response value changed
         */
        actionExpectResponseValueChange() {
            if ( 'text' === this.options.expectResponseFormat && this.options.expectResponseTextRegexEnable ) {
                let outputs = [];
                let regex = /\?<(?<name>.*?)>/gm;
                let match = null;
                while ((match = regex.exec(this.options.expectResponseValue)) !== null) {
                    let name = match.groups.name;
                    outputs.push(name);
                }
                this.options.outputs = outputs;
            }
        },

        /**
         * force update view
         */
        actionFroceUpdate() {
            this.$forceUpdate();
        },

        /**
         * refresh expect response editor
         * @returns {void}
         */
        actionExpectResponseEditorRefresh() {
            let editor = this.$refs.responseEditor;
            if ( undefined !== editor && undefined !== editor.refresh ) {
                editor.refresh();
            }
            this.$message.success(this.$t('test.functionalNode.Directive.expectResponseEditorRefresh'));
        },

        /**
         * refresh parameter editor
         * @returns {void}
         */
        actionParameterEditorRefresh() {
            let editor = this.$refs.parameterEditor;
            if ( undefined !== editor && undefined !== editor.refresh ) {
                editor.refresh();
            }
            this.$message.success(this.$t('test.functionalNode.Directive.expectResponseEditorRefresh'));
        },
    }
}
</script>