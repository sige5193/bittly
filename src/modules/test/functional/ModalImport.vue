<template>
  <a-modal v-if="enable" v-model="enable" :title="$t('test.functional.import')">
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <a-form-item :label="$t('test.functional.importFile')">
        <a-upload
          :directory="false" 
          :multiple="false" 
          :showUploadList="false"
          :beforeUpload="() => false" 
          @change="actionFileChanged"
        >
          <a-button> 
            <a-icon type="upload" /> 
            <span v-if="null === filepath">{{$t('test.functional.importSelectFile')}}</span>
            <span v-else>{{filepath}}</span>
          </a-button>
        </a-upload>
      </a-form-item>
      <a-form-item :label="$t('test.functional.importDirective')">
        <directive-tree-select v-model="directiveId"></directive-tree-select>
      </a-form-item>
    </a-form>

    <template slot="footer">
      <a-button @click="actionCancel">{{$t('button.cancel')}}</a-button>
      <a-button type="primary" @click="actionImport">
        {{$t('test.functional.import')}}
      </a-button>
    </template>
  </a-modal>
</template>
<script>
import Excel from 'exceljs'
import Common from '../../../utils/Common.js'
import MdbFunctionalTestcase from '../../../models/MdbFunctionalTestcase.js';
import DirectiveTreeSelect from '../../directive/entry/DirectiveTreeSelect.vue'
export default {
    name : 'TestFunctionalModalImport',
    components : {
        'directive-tree-select' : DirectiveTreeSelect,
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            enable : false,
            /**
             * @property {String}
             */
            filepath : null,
            /**
             * @property {String}
             */
            directiveId : null,
            /**
             * @property {Object}
             */
            import : {
                graphflow : null,
                lastNode : null,
                lastLink : null,
                nodePositionX : 50,
                nodePositionY : 50,
            },
        };
    },
    methods : {
        /**
         * open import modal
         */
        open() {
            this.enable = true;
        },

        /**
         * event handle on source file selected.
         * @param {Object} info
         */
        async actionFileChanged( info ) {
            this.filepath = info.file.path;
        },

        /**
         * event handler to close the modal
         */
        actionCancel() {
            this.enable = false;
        },

        /**
         * start do import testcase.
         */
        async actionImport() {
            if ( null === this.filepath ) {
                this.$message.error(this.$t('test.functional.importFileIsRequired'));
                return ;
            }

            let workbook = new Excel.Workbook();
            let content = Common.fileGetContent(this.filepath);
            await workbook.xlsx.load(content);
            let sheet = workbook.getWorksheet(1);
            
            let testcase = new MdbFunctionalTestcase();
            testcase.projectId = this.$store.getters.projectActivedId;
            testcase.title = sheet.getCell('B2').value;
            
            let graphflow = {};
            this.import.graphflow = graphflow;
            graphflow.last_node_id = 1;
            graphflow.last_link_id = 1;
            graphflow.nodes = [];
            graphflow.links = [];
            graphflow.groups = [];
            graphflow.config = {};
            graphflow.extra = {};
            graphflow.version = 0.4;
            
            // start node
            this.createStep();
            this.setupLastNodeAsStartNode();

            let parameterFormat = sheet.getCell('B3').value.toLowerCase();
            let responseFormat = sheet.getCell('B4').value.toLowerCase();
            let nodeRowItemCounter = 0;
            let row = null;
            let rowNumber = 7;
            do {
                row = sheet.getRow(rowNumber);
                if ( !row.hasValues ) {
                    break;
                }

                let rowOpt = this.parseStepOptions(row.values[4]);
                let nodeOptions = {
                    title: row.values[1],
                    parameterValue: row.values[2],
                    expectResponseValue: row.values[3],
                    timeout: rowOpt.Timeout || 1000,
                    directiveId: this.directiveId,
                    expectDataLength: 0,
                    parameterFormat: rowOpt.ParameterFormat || parameterFormat,
                    expectResponseFormat: rowOpt.ResponseFormat || responseFormat,
                    inputs: [],
                    outputs: [],
                };
                
                this.createStep();
                this.setupLastNodeAsDirectiveNode(nodeOptions);

                this.import.nodePositionY += 230;
                nodeRowItemCounter ++;
                if ( 0 === nodeRowItemCounter%5 ) {
                    this.import.nodePositionX += 200;
                    this.import.nodePositionY = 50;
                }
                rowNumber ++;
            } while ( row.hasValues );

            // done node
            this.createStep();
            this.setupLastNodeAsDoneNode();

            testcase.content = JSON.stringify(graphflow);
            await testcase.save();

            await this.$parent.refreshEntries();
            this.$parent.openTestcaseById(testcase.id);
            this.enable = false;
            this.$message.success(this.$t('test.functional.importSuccess'));
        },

        /**
         * setup node as start node.
         * @returns {void}
         */
        setupLastNodeAsDirectiveNode(nodeOptions) {
            let lastLinkId = this.import.graphflow.links.at(-1)[0];

            let node = this.import.lastNode;
            node.type = "Directive";
            node.pos[0] = this.import.nodePositionY;
            node.pos[1] = this.import.nodePositionX;
            node.size = {0:210,1:122};
            node.inputs = [
                {name:this.$t('test.functionalNode.Directive.execute'),type:-1,link:lastLinkId}
            ];
            node.outputs = [
                {name:this.$t('test.functionalNode.Directive.success'),type:-1,links:null},
                {name:this.$t('test.functionalNode.Directive.failed'),type:-1,links:null},
                {name:this.$t('test.functionalNode.Directive.executor'),type:"string",links:null}
            ];
            node.properties = {options:JSON.stringify(nodeOptions)};
        },

        /**
         * setup node as done node.
         * @returns {void}
         */
        setupLastNodeAsDoneNode() {
            let lastLinkId = this.import.graphflow.links.at(-1)[0];

            let node = this.import.lastNode;
            node.type = 'Done';
            node.size = [80,30];
            node.inputs = [{name:this.$t('test.functionalNode.Done.execute'),type:-1,link:lastLinkId}];
            node.pos[0] = this.import.nodePositionY + 230;
            node.pos[1] = this.import.nodePositionX;
        },

        /**
         * setup node as start node.
         * @returns {void}
         */
        setupLastNodeAsStartNode() {
            let node = this.import.lastNode;
            node.type = 'Start';
            node.size = [80,30];
            node.outputs = [{
                name:this.$t('test.functionalNode.Start.execute'),
                type:-1,
                links:[this.import.lastLink[0]]
            }];
            node.pos[0] = this.import.nodePositionY;
            node.pos[1] = this.import.nodePositionX;

            this.import.nodePositionX += 100;
        },

        /**
         * create test step and returns the node object.
         * @returns {Object}
         */
        createStep() {
            // setup basic node
            let node = {
                id : this.import.graphflow.last_node_id,
                type : null,
                pos:{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0},
                size:[0,0],
                flags:{},
                order:0,
                mode:0,
                inputs:[],
                outputs:[],
                properties:{options:"{}"}
            };
            this.import.graphflow.last_node_id ++;
            this.import.graphflow.nodes.push(node);
            this.import.lastNode = node;
            
            // push last link
            if ( null !== this.import.lastLink ) {
                this.import.lastLink[3] = node.id;
                this.import.lastLink[4] = 0;
                this.import.graphflow.links.push(this.import.lastLink);
            }

            // setup link
            let link = [];
            link.push(this.import.graphflow.last_link_id); // id
            link.push(node.id); // origin_id
            link.push(0); // origin_slot
            link.push(null); // target_id
            link.push(null); // target_slot
            link.push(-1); // type
            this.import.graphflow.last_link_id ++;
            this.import.lastLink = link;
        },

        /**
         * parse step options
         * @param {String} content
         * @returns {Object}
         */
        parseStepOptions( content ) {
            if ( undefined === content ) {
                return {};
            }
            
            content = content.split("\n");
            let options = {};
            for ( let i=0; i<content.length; i++ ) {
                let opt = content[i].split(':');
                let name = opt[0].trim();
                options[name] = opt[1].trim();
            }
            return options;
        }
    }
}
</script>