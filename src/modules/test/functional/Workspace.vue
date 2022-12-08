<template>
  <div class="h-100 position-relative d-flex flex-dir-column">
    <!-- Header -->
    <a-row class="p-2">
      <a-col :span="12">
        <a-tag color="cyan" v-if="testcase.isNew">NEW</a-tag>
        <a-input v-if="enableTitleEdit" v-model="testcase.title" class="w-50 mr-1"/>
        <span v-else style="font-size:1.3em;padding-right:10px;">{{testcase.title}}</span> 
        <a-button v-if="!enableTitleEdit" @click="enableTitleEdit=true"><a-icon type="edit" /></a-button>
        <a-button v-else @click="enableTitleEdit=false"><a-icon type="check" /></a-button>
      </a-col>
      <a-col :span="12" class="text-right">
        <a-input-number class="mr-1" style="width:100px"
          v-model="testcase.timeout" 
          :min="0"
          :step="100"
          :formatter="value => `${value}ms`"
          :parser="value => value.replace('ms', '')"
        />
        <a-popconfirm
          v-if="!testcase.isNew"
          :title="$t('test.functional.deleteConfirm')"
          :ok-text="$t('button.ok')"
          :cancel-text="$t('button.cancel')"
          @confirm="actionDelete"
        ><a-button type="danger" ghost class="mr-1">{{$t('button.delete')}}</a-button></a-popconfirm>
        <a-button type="primary" ghost class="mr-1" @click="actionSave">{{$t('button.save')}}</a-button>
        <a-button type="primary"
          :disabled="isExecuting" 
          @click="actionRun"
        >
          <a-icon v-if="!isExecuting" type="play-circle" />
          <a-icon v-else type="loading" />
        </a-button>
      </a-col>
    </a-row>

    <!-- node canvas and modals -->
    <div id="test-functional-flow-container" class="h-0 flex-grow position-relative">
      <canvas ref="graphCanvas" class="w-100 h-100" style="background: rgb(214, 214, 214);"></canvas>
      <node-registry :graph="graph" ref="nodeRegistry"/>
    </div>
  </div>
</template>
<script>
import Common from '../../../utils/Common.js'
import ProjectMixin from '../../../utils/ProjectMixin.js'
import NodeRegistry from './node/NodeRegistry.vue'
import WorkspaceGraph from './WorkspaceGraph.js'
import {LGraphCanvas,LiteGraph} from 'litegraph.js'
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
            /**
             * @property {Boolean}
             */
            isExecuting : false,
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
        async initWorkspace() {
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

            this.graphCanvas.adjustMouseEvent = function(e) {
                if (this.canvas) {
                    var b = this.canvas.getBoundingClientRect();
                    e.localX = e.clientX - b.left;
                    e.localY = e.clientY - b.top;
                } else {
                    e.localX = e.clientX;
                    e.localY = e.clientY;
                }

                this.last_mouse_position[0] = e.localX;
                this.last_mouse_position[1] = e.localY;

                e.canvasX = e.localX / this.ds.scale - this.ds.offset[0];
                e.canvasY = e.localY / this.ds.scale - this.ds.offset[1];
            };

            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.curProjectId;
            testcase.title = this.$t('test.functional.unnamed',[MyDate.formatAsShortKey(null)]);
            this.openTestcase(testcase);
            await Common.msleep(100);
            this.graphCanvas.resize();
        },
        
        /**
         * open testcase for workspace
         * @param {MdbFunctionalTestcase} testcase
         */
        openTestcase(testcase) {
            this.testcase = testcase;
            let content = JSON.parse(testcase.content);
            this.graph.configure(content);
            if ( testcase.isNew ) {
                let startNode = LiteGraph.createNode('Start');
                startNode.pos = this.graphCanvas.ds.convertCanvasToOffset([100, 100]);
                this.graph.add(startNode);
            }
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
            await this.getFunctionalEntryMenu().refreshEntries(this.testcase.id);
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
         * execute current testcase
         * @public 
         */
        async execute() {
            this.isExecuting = true;
            let result = {};
            let start = new Date();
            try {
                this.graph.isBatchMode = true;
                await this.graph.run(this.testcase.timeout);
                result.success = true;
                result.message = '';
            } catch (e) {
                result.success = false;
                result.message = e.message;
            } finally {
                result.duration = (new Date()).getTime() - start.getTime();
            }
            this.isExecuting = false;
            return result;
        },

        /**
         * execute all the nodes
         */
        async actionRun() {
            this.isExecuting = true;
            try {
                this.graph.isBatchMode = false;
                await this.graph.run(this.testcase.timeout);
                await Common.msleep(1000);
                this.$success({
                    title: this.$t('test.functional.executeSuccess'),
                    content: this.$t('test.functional.executeSuccessMessage'),
                    okText : this.$t('button.ok')
                });
            } catch ( e ) {
                if ( undefined == e.isModalDisplayed || false == e.isModalDisplayed ) {
                    this.$error({
                        title: this.$t('test.functional.executeFailed'),
                        content: e.message,
                        okText : this.$t('button.ok')
                    });
                }
            }
            this.isExecuting = false;
            await this.$store.dispatch('closeAllCommunicators');
        },
    },
}
</script>