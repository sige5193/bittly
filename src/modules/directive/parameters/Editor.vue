<template>
  <div class="editor p-1" :style="null == height ? {height:'30%'} : {height:`${height}px`}">
    <div v-if="!enable" class="flex-grow bg-light no-parameter-required pt-2">
      <a-empty ref="emptyPlaceholder" :description="$t('directive.parameter.notRequired')" />
    </div>
    <template v-else>
      <div class="border-bottom p-1">
        <a-radio-group 
          ref="radioGroupParamType"
          name="radioGroup" 
          v-model="directive.requestFormat" 
          @change="actionRequestFormatChange"
        >
          <a-radio value="hex"> {{$t('directive.parameter.hex.name')}} </a-radio>
          <a-radio value="text"> {{$t('directive.parameter.text.name')}} </a-radio>
          <a-radio value="file"> {{$t('directive.parameter.file.name')}} </a-radio>
          <a-radio value="form"> {{$t('directive.parameter.form.name')}} </a-radio>
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
        <!-- Parameter Editor -->
        <component 
          v-model="directive"
          v-if="directive.requestFormat && !rawViewerEnable"
          :is="`editor-${directive.requestFormat}`"
          :defaultDataType="formDefaultDataType"
        ></component>
        <!-- Raw Data Viewer -->
        <component
          v-if="rawViewerEnable"
          :is="`viewer-${rawViewerFormat}`"
          :directive="directive"
          :executor="executor"
        ></component>
      </div>
    </template>
  </div>
</template>
<script>
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
            rawViewerEnable : false,
            rawViewerFormat : 'hex',
        };
    },
    methods : {
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