<template>
  <div>
    <a-textarea 
      ref="inputText"
      v-model="content" 
      @input="actionContentInput"
    ></a-textarea>
  </div>
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