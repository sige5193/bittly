<template>
  <div class="w-100 d-flex flex-dir-row">
    <a-input size="small" class="short-input" 
      v-model="options.content" 
      :placeholder="$t('mock.response.inlineEditorHex.placeholder')"
      @change="actionUpdateVModel"
    />
    <a-button size="small" class="short-button" @click="actionEnableFullEditor">
      <a-icon type="edit" />
    </a-button>

    <!-- full editor -->
    <a-modal v-if="fullEditorEnable" v-model="fullEditorEnable" 
      :title="$t('mock.response.inlineEditorHex.fullTitle')"
      :bodyStyle="{padding:0}"
    >
      <a-textarea ref="fullEditor" 
        class="full-editor-textarea" 
        v-model="options.content" 
        :placeholder="$t('mock.response.inlineEditorHex.placeholder')"
        :rows="10"
        @change="actionUpdateVModel"
      />
      <template slot="footer">
        <a-row>
          <a-col :span="12" class="text-left">
            <a-checkbox class="border p-1 rounded"
              v-model="options.enableRegex" 
              @change="actionUpdateVModel"
            >{{$t('mock.response.match.regexEnable')}}</a-checkbox>
          </a-col>
          <a-col :span="12" class="text-right">
            <a-button type="primary" @click="actionFullEditorOk">{{$t('button.ok')}}</a-button>
          </a-col>
        </a-row>
      </template>
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    name : 'MockResponseInlineEditorHex',
    props : {
        /**
         * hex options to edit
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
             * options of hex to editor
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
            content:'', enableRegex:false
        });
    },
    methods: {
        /**
         * enable full editor
         */
        actionEnableFullEditor() {
            this.fullEditorEnable = true;
            setTimeout(() => this.$refs.fullEditor.focus(), 500);
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
.full-editor-textarea {border:none !important;}
.full-editor-textarea:focus {border:none;outline: none; box-shadow: none !important;}
</style>