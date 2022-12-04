<template>
  <a-modal v-if="visible" v-model="visible"
    :title="$t('test.functionalNode.Expect.validateFailed')" 
  >
    <p>
      {{$t('test.functionalNode.Expect.validateMethod')}} : 
      {{$t(`test.functionalNode.Expect.validate${validation.operator}`)}}
    </p>
    <p>{{$t('test.functionalNode.Expect.expectValue')}} : </p>
    <pre class="value-viewer">{{validation.expect}}</pre>
    <p>{{$t('test.functionalNode.Expect.actualValue')}} : </p>
    <pre class="value-viewer">{{validation.actual}}</pre>

    <template slot="footer">
      <a-button type="danger" @click="actionCancel">{{$t('button.close')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import Common from '../../../../../utils/Common.js'
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
             * 
             */
            validation : null,
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
            node.onValidateFailed = (validation) => this.open(node, validation);
        },

        /**
         * open setting modal
         * @param {NodeBase} node
         */
        async open(node,validation) {
            if ( node.graph.isBatchMode ) {
                return ;
            }
            this.validation = validation;
            await Common.msleep(1000);
            this.visible = true;
        },

        /**
         * event handler on modal canceled
         */
        actionCancel() {
            this.visible = false;
        },
    }
}
</script>
<style scoped>
.value-viewer {background: #d4d4d4;padding: 7px;border-radius: 5px;color: #5f5f5f;}
</style>