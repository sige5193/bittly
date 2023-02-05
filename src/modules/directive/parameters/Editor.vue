<template>
  <div class="editor p-1" :style="null == height ? {height:'30%'} : {height:`${height}px`}">
    <div v-if="!enable" class="flex-grow bg-light no-parameter-required pt-2">
      <a-empty ref="emptyPlaceholder" :description="$t('directive.parameter.notRequired')" />
    </div>
    <template v-else>
      <div class="border-bottom p-1 white-space-nowrap">
        <a-radio-group 
          ref="radioGroupParamType"
          name="radioGroup" 
          v-model="directive.requestFormat" 
          @change="actionRequestFormatChange"
        >
          <a-radio v-for="(editor, editorName) in editors" :key="editorName" :value="editorName"
          > {{editor.label}} </a-radio>
        </a-radio-group>
      
        <a-switch 
          v-if="null != executor"
          default-checked 
          class="ml-1"
          style="float:right;"
          checked-children="RAW" 
          un-checked-children="RAW"
          v-model="rawViewerEnable"
        />
 
        <a-radio-group 
          v-if="rawViewerEnable"
          v-model="rawViewerFormat" 
          size="small" 
          style="float:right;"
        >
          <a-radio-button value="hex">{{$t('directive.parameter.hex.name')}}</a-radio-button>
          <a-radio-button value="text">{{$t('directive.parameter.text.name')}}</a-radio-button>
          <a-radio-button value="form">{{$t('directive.parameter.form.name')}}</a-radio-button>
        </a-radio-group>
      </div>

      <div class="mt-1 pb-3 content">
        <!-- editor is not available -->
        <a-result status="error"
          v-if="undefined === editors[directive.requestFormat]"
          :sub-title="$t('directive.parameter.editorNotAvailable')"
        ></a-result>
        <!-- custom viewer -->
        <custom-viewer-wrapper 
          v-else-if="
            !rawViewerEnable 
            && undefined != editors[directive.requestFormat].isCustom 
            && true == editors[directive.requestFormat].isCustom
          "
          :name="directive.requestFormat"
          v-model="directive"
        />
        <!-- Parameter Editor -->
        <component 
          v-else-if="!rawViewerEnable && directive.requestFormat"
          v-model="directive"
          :is="`editor-${directive.requestFormat}`"
          :defaultDataType="formDefaultDataType"
        ></component>
        <!-- Raw Data Viewer -->
        <component
          v-else
          :is="`viewer-${rawViewerFormat}`"
          :directive="directive"
          :executor="executor"
        ></component>
      </div>
    </template>
  </div>
</template>
<script>
import CustomViewerWrapper from './CustomViewerWrapper.vue'
import FormViewer from './form/Viewer.vue'
import FormEditor from './form/Editor.vue'
import HexViewer from './hex/Viewer.vue'
import HexEditor from './hex/Editor.vue'
import TextViewer from './text/Viewer.vue'
import TextEditor from './text/Editor.vue'
import FileEditor from './file/Editor.vue'
import NoneEditor from './none/Editor.vue'
export default {
    components : {
        'editor-form' : FormEditor,
        'editor-hex' : HexEditor,
        'editor-text' : TextEditor,
        'editor-file' : FileEditor,
        'editor-none' : NoneEditor,
        'viewer-form' : FormViewer,
        'viewer-hex' : HexViewer,
        'viewer-text' : TextViewer,
        'custom-viewer-wrapper' : CustomViewerWrapper,
    },
    props : {
        /**
         * disable/enable parameter editor
         * @property {Boolean}
         */
        enable : Boolean,
        /**
         * the directive model
         * @property {MdbDirective}
         */
        directive : Object,
        /**
         * default form data type.
         * @property {String}
         */
        formDefaultDataType : String,
        /**
         * the executor instance
         * @property {Exector}
         */
        executor : {},
        /**
         * @property {Number|null}
         */
        height : {},
    },
    data() {
        return {
            /**
             * list of editors
             * @property {Object<String:Object>}
             */
            editors : {},

            rawViewerEnable : false,
            rawViewerFormat : 'hex',
        };
    },
    created() {
        this.editors = {};
        this.editors.hex = {name:'hex',label:this.$t('directive.parameter.hex.name')};
        this.editors.text = {name:'text',label:this.$t('directive.parameter.text.name')};
        this.editors.file = {name:'file',label:this.$t('directive.parameter.file.name')};
        this.editors.form = {name:'form',label:this.$t('directive.parameter.form.name')};
        this.$eventBus.$emit('app-directive-parameter-editor-init', this);
    },
    methods : {
        /**
         * register response viewer
         * @public
         * @param {Object} editor
         * @param {Class} elemClass
         */
        customEditorRegister( editor, elemClass ) {
            this.editors[editor.name] = editor;
            editor.isCustom = true;
            let elemName = `directive-parameter-editor-${editor.name}`;
            if ( undefined === window.customElements.get(elemName) ) {
                window.customElements.define(elemName, elemClass);
            }
        },

        /**
         * trigger event on request format change.
         * @emit directive-request-format-change
         */
        actionRequestFormatChange() {
            this.rawViewerEnable = false;
            this.$emit('directive-request-format-change');
        }
    },
}
</script>
<style scoped>
.editor {display: flex;flex-direction: column;overflow: hidden;}
.content {flex-grow: 1;overflow: auto;}
.no-parameter-required {display: flex;flex-direction: column;justify-content: center;align-items: center;font-size: 1.5em;color: #d9d9d9;}
</style>