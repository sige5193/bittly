<template>
  <div class="w-100 d-flex flex-dir-row">
    <a-input size="small" class="short-input" 
      v-model="options.content" 
      :placeholder="$t('mock.response.inlineEditorScript.placeholder')"
      @change="actionUpdateVModel"
    />
    <a-button size="small" class="short-button" @click="actionEnableFullEditor">
      <a-icon type="edit" />
    </a-button>

    <!-- full editor -->
    <a-modal v-if="fullEditorEnable" v-model="fullEditorEnable" 
      :title="$t('mock.response.inlineEditorText.fullTitle')"
      :bodyStyle="{padding:0,height:'300px'}"
    >
      <code-editor v-model="options.content" 
        :lineNumbers="true"
        @change="actionUpdateVModel"
      ></code-editor>
      <template slot="footer">
        <a-button type="primary" @click="actionFullEditorOk">{{$t('button.ok')}}</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import CodeEditor from '../../../../components/CodeEditor.vue'
import MyObject from '../../../../utils/datatype/MyObject.js';
import DataGeneratorScriptRuntime from '../DataGeneratorScriptRuntime.js'
export default {
    name : 'MockResponseInlineEditorScript',
    components : {
        'code-editor' : CodeEditor,
    },
    props : {
        /**
         * text options to edit
         * @property {Object}
         */
        value : {}
    },
    data() {
        return {
            /**
             * enable full editor
             * @property {Boolean}
             */
            fullEditorEnable : false,
            /**
             * options of text to editor
             * @property {Object}
             */
            options : {},
        };
    },
    created() {
        this.options = this.value;
        if ( undefined === this.options ) {
            this.options = {};
        }
        MyObject.applyDefaultValues(this.options, {
            content:'',
        });
        window.$this = new DataGeneratorScriptRuntime();
    },
    methods: {
        /**
         * enable full editor
         */
        actionEnableFullEditor() {
            this.fullEditorEnable = true;
        },
        
        /**
         * done content editting
         */
        actionFullEditorOk() {
            this.fullEditorEnable = false;
        },

        /**
         * update v-model
         */
        actionUpdateVModel() {
            this.$emit('input', this.options);
            this.$emit('change');
            this.$forceUpdate();
        }
    }
}
</script>
<style scoped>
.short-input {border-top-right-radius: 0;border-bottom-right-radius: 0;border-right: none;}
.short-button {border-top-left-radius: 0;border-bottom-left-radius: 0;}
</style>