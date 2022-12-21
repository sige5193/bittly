<template>
  <component ref="editor" 
    :is="`directive-parameter-editor-${name}`" 
    @change="actionContentChange"
  />
</template>
<script>
export default {
    name : 'DirectiveParameterEditorCustomWrapper',
    props : {
        /**
         * @property {String}
         */
        name : {type:String},
        /**
         * @property {MdbDirective}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * @property {MdbDirective}
             */
            directive : null,
        };
    },
    /**
     * 
     */
    mounted() {
        this.initVModel();
    },
    methods : {
        /** 
         * init v-model
         **/ 
        initVModel() {
            this.directive = this.value;
            
            let name = this.name;
            if ( undefined === this.directive.requestContent[name] ) {
                this.directive.requestContent[name] = null;
            }
            
            let content = this.directive.requestContent[name];
            this.$refs.editor.setParameter(content);
        },

        /**
         * event handler on content changed
         */
        actionContentChange() {
            let name = this.name;
            this.directive.requestContent[name] = this.$refs.editor.getContent();
            this.$emit('input', this.directive);
        },
    }
}
</script>