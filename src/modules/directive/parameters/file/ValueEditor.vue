<template>
  <div>
    <a-upload 
      ref="upload"
      :showUploadList="false"
      :multiple="false"
      :beforeUpload="() => false"
      @change="actionFileChanged"
    >
      <a-button> <a-icon type="file" /> {{$t('directive.parameter.file.select')}} </a-button>
    </a-upload>
    <span class="ml-2">{{filepath}}</span>
  </div>
</template>
<script>
export default {
    name : 'DirectiveParamValueEditorFile',
    props : ['value'],
    data() {
        return {
            filepath : null,
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
            this.filepath = this.value;
            if ( 'string' != typeof(this.value) ) {
                this.filepath = '';
            }
        },

        /**
         * update v-model
         */
        actionFileChanged(info) {
            this.filepath = info.file.path;
            this.$emit('input', this.filepath);
        }
    }
}
</script>