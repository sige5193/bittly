<template>
  <div style="display:none;">
    <node-setting-variable />
    <node-setting-delay />
    <node-setting-script />
    <node-setting-if />
    <node-setting-loop />
    <node-setting-directive />
    <node-directive-execution />
    <node-setting-read />
    <node-setting-expect />
    <node-setting-write />
  </div>
</template>
<script>
import {LiteGraph} from 'litegraph.js'
import NodeVariableSetting from './variable/Setting.vue'
import NodeDelaySetting from './delay/Setting.vue'
import NodeSettingScript from './script/Setting.vue'
import NodeSettingIf from './if/Setting.vue'
import NodeSettingLoop from './loop/Setting.vue'
import NodeSettingRead from './read/Setting.vue'
import NodeSettingExpect from './expect/Setting.vue'
import NodeSettingWrite from './write/Setting.vue'
import NodeSettingDirective from './directive/Setting.vue'
import NodeDirectiveExecution from './directive/Execution.vue'
import NodeStart from './start/Node.js'
import NodeVariable from './variable/Node.js'
import NodeActHub from './acthub/Node.js'
import NodeDelay from './delay/Node.js'
import NodeScript from './script/Node.js'
import NodeIf from './if/Node.js'
import NodeLoop from './loop/Node.js'
import NodeDirective from './directive/Node.js'
import NodeRead from './read/Node.js'
import NodeExpect from './expect/Node.js'
import NodeDone from './done/Node.js'
import NodeWrite from './write/Node.js'
export default {
    components : {
        'node-setting-variable' : NodeVariableSetting,
        'node-setting-delay' : NodeDelaySetting,
        'node-setting-script' : NodeSettingScript,
        'node-setting-if' : NodeSettingIf,
        'node-setting-loop' : NodeSettingLoop,
        'node-setting-directive' : NodeSettingDirective,
        'node-directive-execution' : NodeDirectiveExecution,
        'node-setting-read' : NodeSettingRead,
        'node-setting-expect' : NodeSettingExpect,
        'node-setting-write' : NodeSettingWrite,
    },
    props : {
        graph : {},
    },
    data() {
        return {
            onNodeAddedHandlers : [],
        };
    },
    created() {
        LiteGraph.clearRegisteredTypes();
        LiteGraph.onNodeTypeRegistered = ( type, baseClass ) => this.onNodeTypeRegistered(type, baseClass);
        LiteGraph.registerNodeType("Start", NodeStart);
        LiteGraph.registerNodeType("Directive", NodeDirective);
        LiteGraph.registerNodeType("Script", NodeScript);
        LiteGraph.registerNodeType("Variable", NodeVariable);
        LiteGraph.registerNodeType("Expect", NodeExpect);
        LiteGraph.registerNodeType("Delay", NodeDelay);
        LiteGraph.registerNodeType("If", NodeIf);
        LiteGraph.registerNodeType("Loop", NodeLoop);
        LiteGraph.registerNodeType("Read", NodeRead);
        LiteGraph.registerNodeType("Write",NodeWrite);
        LiteGraph.registerNodeType("ActHub", NodeActHub);
        LiteGraph.registerNodeType("Done", NodeDone);
    },
    mounted() {
        this.graph.onNodeAdded = node => this.onNodeAdded(node);
    },
    methods : {
        /**
         * register callback handler on new node added
         */
        registerNodeAddHandler (callback) {
            this.onNodeAddedHandlers.push(callback);
        },

        /**
         * callback handler on node added
         */
        onNodeAdded( node ) {
            for ( let i=0; i<this.onNodeAddedHandlers.length; i++ ) {
                this.onNodeAddedHandlers[i](node);
            }
        },

        /**
         * callback handler on node type registered
         * @param {String} type
         * @param {String} baseClass
         */
        onNodeTypeRegistered( type, baseClass ) {
            if ( '' === baseClass.category ) {
                baseClass.category = null;
            }
            baseClass.title = this.$t(`test.functionalNode.${type}.name`);
        },
    },
}
</script>