<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.Write.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-radio-group v-model="options.mode" button-style="solid">
        <a-radio-button value="hex">{{$t('test.functionalNode.Write.modeHex')}}</a-radio-button>
        <a-radio-button value="text">{{$t('test.functionalNode.Write.modeText')}}</a-radio-button>
      </a-radio-group>

      <div class="mt-1" style="height:200px;">
        <code-editor v-model="options.content" mode="text" />
      </div>
    </a-form>
  </a-modal>
</template>
<script>
import CodeEditor from '../../../../../components/CodeEditor.vue'
import NodeBase from '../NodeBase.js'
import NodeWrite from './Node.js'
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
    },
    methods : {
        /**
         * callback handler on new node added.
         * @param {LGraphNode} node
         */
        onNodeAdded( node ) {
            if ( !(node instanceof NodeWrite) ) {
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