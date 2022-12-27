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
    <span class="ml-2">{{file.path}}</span>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject';
export default {
    name : 'DirectiveParamValueEditorFile',
    props : ['value'],
    data() {
        return {
            file : {},
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
            this.file = this.value;
            if ( null === this.file || 'object' != typeof(this.value) ) {
                this.file = {};
            }
        },

        /**
         * update v-model
         */
        actionFileChanged(info) {
            this.file.path = info.file.path;
            this.file.sendMode = 'All';
            this.$emit('input', MyObject.copy(this.file));
            this.$forceUpdate();
        }
    }
}
</script>