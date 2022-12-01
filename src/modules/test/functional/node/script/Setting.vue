<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.Script.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('test.functionalNode.Script.inputs')" labelAlign="left" class="mb-0">
        <a-select mode="tags" v-model="options.inputs"></a-select>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.Script.outputs')" labelAlign="left" class="mb-0">
        <a-select mode="tags" v-model="options.outputs"></a-select>
      </a-form-item>
      <div class="mt-2" style="height:300px;">
        <code-editor v-model="options.script"></code-editor>
      </div>
    </a-form>
  </a-modal>
</template>
<script>
import CodeEditor from '../../../../../components/CodeEditor.vue'
import NodeBase from '../NodeBase.js'
import NodeScript from './Node.js'
export default {
    components : {
        'code-editor' : CodeEditor,
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            visible : false,
            /**
             * @property {Object}
             */
            options : {},
            /**
             * @property {NodeBase}
             */
            node : null,
        };
    },
    mounted() {
        this.$parent.registerNodeAddHandler(node => this.onNodeAdded(node));
        window.$this = new NodeScript();
    },
    methods : {
        /**
         * callback handler on new node added.
         * @param {LGraphNode} node
         */
        onNodeAdded( node ) {
            if ( !(node instanceof NodeScript) ) {
                return ;
            }
            node.onBtnSettingClicked = () => this.open(node);
        },

        /**
         * open setting modal
         * @param {NodeBase} node
         */
        open(node) {
            this.node = node;
            this.options = node.getOptions();
            this.visible = true;
        },

        /**
         * event handler on modal canceled
         */
        actionCancel() {
            this.visible = false;
        },

        /**
         * event handler on modal ok
         */
        actionOk() {
            this.node.setOptions(this.options);
            this.visible = false;
        }
    }
}
</script>