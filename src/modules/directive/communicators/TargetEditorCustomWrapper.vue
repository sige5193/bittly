<template>
  <component ref="editor"
    :is="`directive-target-editor-${name}`" 
    @change="actionTargetChange"
  />
</template>
<script>
import MyObject from '../../../utils/datatype/MyObject.js'
export default {
    name : 'DirectiveCommunicatorTargetEditorCustomWrapper',
    props : {
        /**
         * @property {String}
         */
        name : {type:String},
        /**
         * @property {Object}
         */
        value : {},
    },
    data() {
        return {
            /**
             * @property {Object|null}
             */
            target : null,
        };
    },
    mounted() {
        this.initVModel();
    },
    methods : {
        /** 
         * init v-model
         **/ 
        initVModel() {
            this.target = this.value;
            this.$refs.editor.setTarget(MyObject.copy(this.target));
        },

        /**
         * event handler on target changed
         */
        actionTargetChange() {
            let newConfig = this.$refs.editor.getConfiguration();
            newConfig.type = this.target.type;
            this.target = newConfig;
            this.$emit('input', newConfig);
            this.$emit('change');



            // if ( this.isEditorInited && this.isDisconnectRequired ) {
            //     this.isDisconnectRequired = false;
            //     // offline the device before update target model.
            //     let comkey = this.getComKeyByOptions(this.value);
            //     let com = this.$store.getters.communicators[comkey];
            //     if ( undefined != com ) {
            //         await com.close();
            //     }
            // }
        },
    },
}
</script>