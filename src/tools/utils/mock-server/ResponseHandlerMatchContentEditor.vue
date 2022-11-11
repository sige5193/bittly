<template>
  <div class="d-flex flex-dir-row">
    <a-input 
      size="small"
      style="border-radius: 3px 0 0 3px;border-right: none;"
      v-model="content"
      :placeholder="$t('messages.exampleContent',['text'==mode ? 'I am fine, thank you.' : 'FF 01 CD FF'])"
      @change="actionInputChange"
    />
    <a-button 
      class="text-center"
      size="small"
      style="border-radius: 0 3px 3px 0;"
      @click="actionEditorOpen"
    ><a-icon type="edit" /></a-button>

    <a-modal 
      v-if="editorEnable" 
      v-model="editorEnable" 
      :title="$t('app.tool.responseHandlerMatchColResponseEditorTitle')" 
      :bodyStyle="{padding:0}"
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionEditorOk"
    >
      <a-textarea 
        v-model="editorContent" 
        :auto-size="{ minRows: 10, maxRows: 10 }"
        :placeholder="$t('messages.exampleContent',['text'==mode ? 'I am fine, thank you.' : 'FF 01 CD FF'])"
      />
    </a-modal>
  </div>
</template>
<script>
export default {
    name : 'ResponseHandlerMatchContentEditor',
    props : {
        /**
         * @property {String}
         */
        value : String,
        /**
         * @property {'text'|'hex'}
         */
        mode : String,
    },
    data() {
        return {
            /**
             * input content
             */
            content : '',
            /**
             * @property {Boolean}
             */
            editorEnable : false,
            /**
             * @property {null|String}
             */
            editorContent : null,
        };
    },
    mounted() {
        this.content = this.value;
    },
    methods : {
        /**
         * event handler on input change
         */
        actionInputChange() {
            this.$emit('input', this.content);
            this.$emit('change');
        },

        /**
         * enable content editor
         */
        actionEditorOpen() {
            this.editorContent = this.content;
            this.editorEnable = true;
        },

        /**
         * event handler on editor ok
         */
        actionEditorOk() {
            this.content = this.editorContent;
            this.editorEnable = false;
            this.actionInputChange();
        },
    },
}
</script>