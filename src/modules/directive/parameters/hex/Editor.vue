<!--
 - directive parameter editor for hex
 - @author sige
-->
<template>
  <div class="h-100">
    <a-textarea 
      class="h-100"
      ref="inputarea"
      spellcheck="false" 
      v-model="content"
      :rows="4"
      :placeholder="$t('directive.parameter.hex.editorPlaceholder')"
      @input="actionTextareaInput"
    />
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'DirectiveParameterEditorHex',
    props : ['value'],
    data() {
        return {
            directive : null,
            content : null,
        };
    },
    mounted () {
        this.initVModel();
    },
    methods: {
        /** 
         * init v-model
         **/ 
        initVModel() {
            this.directive = this.value;
            this.content = this.directive.requestContent.hex;
            if ( Common.isEmpty(this.content) ) {
                this.content = '';
            }
        },

        /**
         * update v-model
         */
        updateVModel() {
            this.directive.requestContent.hex = this.content;
            this.directive.requestContent = Common.objCopy(this.directive.requestContent);
            this.$emit('input', this.directive);
        },

        /**
         * event handler for textarea input
         */
        actionTextareaInput() {
            this.updateVModel();
        },
    },
}
</script>