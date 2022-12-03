<template>
  <a-modal v-model="visible" 
    :title="$t('test.functionalNode.Read.settingTitle')" 
    :okText="$t('button.ok')"
    :cancelText="$t('button.cancel')"
    @cancel="actionCancel" 
    @ok="actionOk"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('test.functionalNode.Read.title')">
        <a-input v-model="options.title"/>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.Read.mode')">
        <a-select v-model="options.mode">
          <a-select-option value="AllChars">{{$t('test.functionalNode.Read.modeAllChars')}}</a-select-option>
          <a-select-option value="AllBytes">{{$t('test.functionalNode.Read.modeAllBytes')}}</a-select-option>
          <a-select-option value="Chars">{{$t('test.functionalNode.Read.modeChars')}}</a-select-option>
          <a-select-option value="Bytes">{{$t('test.functionalNode.Read.modeBytes')}}</a-select-option>
          <a-select-option value="Lines">{{$t('test.functionalNode.Read.modeLines')}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.Read.length')">
        <a-input v-model="options.length"/>
      </a-form-item>
      <a-form-item :label="$t('test.functionalNode.Read.timeout')">
        <a-input v-model="options.timeout"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import NodeBase from '../NodeBase.js'
import NodeRead from './Node.js'
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
            if ( !(node instanceof NodeRead) ) {
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