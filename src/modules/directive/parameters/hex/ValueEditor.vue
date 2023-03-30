<template>
  <a-textarea ref="inputHex"
    v-model="content" 
    :auto-size="{minRows:3,maxRows:5}"
    :placeholder="$t('directive.parameter.hex.editorPlaceholder')"
    @input="actionContentInput"
  ></a-textarea>
</template>
<script>
export default {
    name : 'DirectiveParamValueEditorHex',
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
         * init v-model
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
        actionContentInput() {
            this.$emit('input', this.content);
        }
    }
}
</script>