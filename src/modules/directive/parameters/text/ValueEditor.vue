<template>
  <a-textarea
    ref="inputText"
    v-model="content" 
    :auto-size="{minRows:3,maxRows:5}"
    :placeholder="$t('directive.parameter.text.editorPlaceholder')"
    @change="actionContentChange"
  ></a-textarea>
</template>
<script>
export default {
    name : 'DirectiveParamValueEditorString',
    props : ['value'],
    data() {
        return {
            content : null,
        };
    },
    mounted() {
        this.initVModel();
    },
    methods : {
        /**
         * init vmodel
         */
        initVModel() {
            this.content = '';
            if ( 'string' == typeof(this.value) ) {
                this.content = this.value;
            }
        },

        /**
         * update v-model
         */
        actionContentChange() {
            this.$emit('input', this.content);
            this.$emit('change');
        }
    }
}
</script>