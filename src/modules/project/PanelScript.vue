<template>
  <div class="h-100 position-relative">
    <template v-if="null != project">
      <div class="toolbar">
        <a-button 
          v-if="scriptContent != project.script"
          size="small" 
          @click="actionSave"
        >{{$t('button.save')}}</a-button>
      </div>
      <codemirror 
        class="h-100"
        ref="editor"
        :options="scriptEditorOptions" 
        v-model="scriptContent"
      ></codemirror>
    </template>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import "codemirror/theme/ambiance.css";
import "codemirror/addon/hint/show-hint.css"
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/lua/lua");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint")
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'PanelScript',
    mixins : [ComponentProjectMixin],
    components : {
        codemirror,
    },
    data() {
        return {
            scriptContent : '',
            scriptEditorOptions : {
                mode:'javascript',
                theme: 'ambiance',
                readOnly:false,
                lineNumbers:true,
                lineWrapping:true,
                autofocus:true,
                hintOptions : {
                    completeSingle: false,
                },
            },
        };
    },
    methods : {
        /**
         * init the widget
         */
        async init() {
            this.scriptContent = this.project.script;
            let $this = this;
            this.$nextTick(() => {
                $this.$refs.editor.codemirror.display.wrapper.style.height = '100%';
            });
        },

        /**
         * event handler on button save clicked.
         * save project script content.
         */
        async actionSave() {
            this.project.script = this.scriptContent;
            await this.project.save();
        }
    },
}
</script>
<style scoped>
.toolbar {position: absolute;top: 5px;right: 5px;z-index: 999;}
</style>