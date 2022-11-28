<template>
  <div class="h-100 position-relative d-flex flex-dir-column">
    <!-- Header -->
    <a-row class="p-2">
      <a-col :span="12">
        <a-input v-if="enableTitleEdit" v-model="testcase.title" class="w-50 mr-1"/>
        <span v-else style="font-size:1.3em;padding-right:10px;">{{testcase.title}}</span> 
        <a-button v-if="!enableTitleEdit" @click="enableTitleEdit=true"><a-icon type="edit" /></a-button>
        <a-button v-else @click="enableTitleEdit=false"><a-icon type="check" /></a-button>
      </a-col>
      <a-col :span="12" class="text-right">
        <a-popconfirm
          :title="$t('test.functional.deleteConfirm')"
          :ok-text="$t('button.ok')"
          :cancel-text="$t('button.cancel')"
          @confirm="actionDelete"
        ><a-button class="mr-1">{{$t('button.delete')}}</a-button></a-popconfirm>
        <a-button @click="actionSave">{{$t('button.save')}}</a-button>
      </a-col>
    </a-row>

    <!-- node canvas and modals -->
    <div id="test-functional-flow-container" class="h-0 flex-grow position-relative">
      <canvas ref="graphCanvas" class="w-100 h-100" style="background: rgb(214, 214, 214);"></canvas>
      <node-registry :graph="graph" ref="nodeRegistry"/>
    </div>

    <!-- toolbar  -->
    <div class="toolbox text-right p-2">
      <a-button @click="actionRun" class="mr-1"><a-icon type="play-circle" /></a-button>
    </div>
  </div>
</template>
<script>
import ProjectMixin from '../../../utils/ProjectMixin.js'
import NodeRegistry from './node/NodeRegistry.vue'
import WorkspaceGraph from './WorkspaceGraph.js'
import {LGraphCanvas} from 'litegraph.js'
import MdbFunctionalTestcase from '../../../models/MdbFunctionalTestcase.js'
import MyDate from '../../../utils/datatype/MyDate.js'
require('litegraph.js/css/litegraph.css')
export default {
    name : 'TestFunctionalWorkspace',
    mixins : [ProjectMixin],
    components : {
        'node-registry' : NodeRegistry,
    },
    props : {
        getFunctionalEntryMenu : {type:Function,required:true},
    },
    data() {
        return {
            /**
             * @property {LGraphCanvas}
             */
            graphCanvas : null,
            /**
             * @property {WorkspaceGraph}
             */
            graph : null,
            /**
             * instance of functional testcase
             * @property {MdbFunctionalTestcase}
             */
            testcase : new MdbFunctionalTestcase(),
            /**
             * indicate enable title editor or not
             * @property {Boolean}
             */
            enableTitleEdit : false,
        };
    },
    created() {
        this.graph = new WorkspaceGraph();
    },
    mounted() {
        this.initWorkspace();
    },
    methods : {
        /**
         * init workspace
         */
        initWorkspace() {
            this.graphCanvas = new LGraphCanvas(this.$refs.graphCanvas, this.graph, {autoresize:true});
            this.graphCanvas.background_image = false;
            this.graphCanvas.render_canvas_border = false;
            this.graphCanvas.drawBackCanvas();
            this.graphCanvas.drawFrontCanvas();
            this.graphCanvas.getMenuOptions = () => [{
                content: this.$t('test.functional.addNode'),
                has_submenu: true,
                callback: LGraphCanvas.onMenuAdd
            }];

            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.curProjectId;
            testcase.title = this.$t('test.functional.unnamed',[MyDate.formatAsShortKey(null)]);
            this.openTestcase(testcase);
            setTimeout(()=>this.graphCanvas.resize(),100);
        },
        
        /**
         * open testcase for workspace
         * @param {MdbFunctionalTestcase} testcase
         */
        openTestcase(testcase) {
            this.testcase = testcase;
            let content = JSON.parse(testcase.content);
            this.graph.configure(content);
        },
        
        /**
         * save testcase
         */
        async actionSave() {
            this.testcase.content = JSON.stringify(this.graph.serialize());
            let isSaved = await this.testcase.save();
            if ( !isSaved ) {
                this.$message.error(this.$t('test.functional.saveFailed'));
                return;
            }

            this.$message.success(this.$t('test.functional.saveSuccess'));
            await this.getFunctionalEntryMenu().refreshEntries();
        },

        /**
         * delete current testcase
         */
        async actionDelete() {
            await this.testcase.delete();
            this.$message.success(this.$t('test.functional.deleteSuccess'));
            await this.getFunctionalEntryMenu().refreshEntries();

            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.curProjectId;
            testcase.title = this.$t('test.functional.unnamed',[MyDate.formatAsShortKey(null)]);
            this.openTestcase(testcase);
        },

        /**
         * execute all the nodes
         */
        async actionRun() {
            await this.graph.run();
        },
    },
}
</script>
<style scoped>
.toolbox {position:absolute;bottom:0;width:100%;}
</style>