<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.Expect.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('test.functionalNode.Expect.validateMethod')">
        <a-select v-model="options.operator">
          <a-select-option value="Equal">{{$t('test.functionalNode.Expect.validateEqual')}}</a-select-option>
          <a-select-option value="NotEqual">{{$t('test.functionalNode.Expect.validateNotEqual')}}</a-select-option>
          <a-select-option value="GreaterThan">{{$t('test.functionalNode.Expect.validateGreaterThan')}}</a-select-option>
          <a-select-option value="GreaterOrEqual">{{$t('test.functionalNode.Expect.validateGreaterOrEqual')}}</a-select-option>
          <a-select-option value="LessThan">{{$t('test.functionalNode.Expect.validateLessThan')}}</a-select-option>
          <a-select-option value="LessOrEqual">{{$t('test.functionalNode.Expect.validateLessOrEqual')}}</a-select-option>
          <a-select-option value="Regex">{{$t('test.functionalNode.Expect.validateRegex')}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.Expect.expectValue')">
        <a-textarea v-model="options.expectValue" :rows="4" auto-size/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import NodeBase from '../NodeBase.js'
import NodeExpect from './Node.js'
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
            if ( !(node instanceof NodeExpect) ) {
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