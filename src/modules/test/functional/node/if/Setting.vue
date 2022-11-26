<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.If.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('test.functionalNode.If.title')" labelAlign="left" class="mb-0">
        <a-input mode="tags" v-model="options.title" />
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.If.inputs')" labelAlign="left" class="mb-0">
        <a-select mode="tags" v-model="options.inputs"></a-select>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.If.expression')" labelAlign="left" class="mb-0">
        <a-textarea v-model="options.expression" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import NodeBase from '../NodeBase.js'
import NodeIf from './Node.js'
export default {
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
            if ( !(node instanceof NodeIf) ) {
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