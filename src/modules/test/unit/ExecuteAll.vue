<template>
  <a-modal v-model="enable" :closable="false" :maskClosable="false" :keyboard="false"
    :title="$t('test.testcaseExecuteSummaryTitle')"
  >
    <a-row>
      <a-col :span="8">
        <a-statistic :title="$t('test.unit.executeAllCurIndex')" :value="activeIndex">
          <template #suffix><span> / {{directives.length}}</span></template>
        </a-statistic>
      </a-col>
      <a-col :span="4">
        <a-statistic :title="$t('test.testcaseExecuteStatusPass')" :value="successCount" class="demo-class"/>
      </a-col>
      <a-col :span="4">
        <a-statistic :title="$t('test.testcaseExecuteStatusNotPass')" :value="failedCount" class="demo-class" />
      </a-col>
      <a-col :span="8">
        <a-statistic :title="$t('test.duration')" :value="duration" :formatter="formatDuration" class="demo-class" />
      </a-col>
    </a-row>

    <div class="mt-3">
      <a-progress :percent="progressPercent" />
    </div>

    <div ref="resultListContainer" class="mt-3 overflow-y-auto" style="max-height:200px;">
      <a-collapse>
        <a-collapse-panel v-for="(result,index) in results" :key="index"
          class="test-functional-execall-task-collapse-panel"
          :class="{success:result.success==true,failed:result.success==false}"
          :header="result.directive.name"
        >
          <a-descriptions :column="2">
            <a-descriptions-item :label="$t('test.execStatus')">
              <a-tag v-if="true === result.success" color="green">{{$t('test.testcaseExecuteStatusPass')}}</a-tag>
              <a-tag v-else-if="false === result.success" color="red">{{$t('test.testcaseExecuteStatusNotPass')}}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item :label="$t('test.duration')">{{result.duration}}ms</a-descriptions-item>
            <a-descriptions-item v-if="0 != result.message.length" :label="$t('test.message')" :span="2">
              {{result.message}}
            </a-descriptions-item>
          </a-descriptions>
          <a-icon v-if="null === result.success" slot="extra" type="loading" />
          
          <ul class="p-3" v-if="0 < result.testcases.length">
            <li v-for="(detail,index) in result.testcases" :key="index">
              <a-icon v-if="detail.success" type="check-circle" style="color:green;"/>
              <a-icon v-else type="close-circle" style="color:red;"/>
              {{detail.testcase.title}} 
            </li>
          </ul>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <template slot="footer">
      <a-button key="back" v-if="!isExecuting" @click="actionClose">{{$t('button.cancel')}}</a-button>
      <a-button type="primary" @click="actionStart" :disabled="isExecuting" :loading="isExecuting">{{$t('test.buttonStart')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import Common from '../../../utils/Common.js'
import Formatter from '../../../utils/Formatter.js'
import MdbDirective from '../../../models/MdbDirective';
export default {
    props : {
        /**
         * @property {Function}
         */
        getWorkspace : {type:Function,required:true},
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            enable : false,
            /**
             * @property {Array<MdbDirective>}
             */
            directives : [],
            /**
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * @property {Array<Object>}
             */
            results : [],
            /**
             * @property {Number}
             */
            duration : 0,
            /**
             * @property {Number}
             */
            activeIndex : 0,
        };
    },
    computed : {
        progressPercent() {
            return Math.round(this.activeIndex / this.directives.length * 100);
        },
        successCount() {
            let count = 0;
            for ( let i=0; i<this.results.length; i++ ) {
                if ( this.results[i].success ) {
                    count ++;
                }
            }
            return count;
        },
        failedCount() {
            let count = 0;
            for ( let i=0; i<this.results.length; i++ ) {
                if ( false === this.results[i].success ) {
                    count ++;
                }
            }
            return count;
        },
    },
    methods : {
        /**
         * open execute all modal
         */
        async open() {
            this.directives = [];
            let projectId = this.$store.getters.projectActivedId;
            this.directives = await MdbDirective.findAll({project_id:projectId});
            this.enable = true;
        },

        /**
         * start to execute all testcases
         */
        async actionStart() {
            let startTime = (new Date()).getTime();
            this.duration = 0;
            this.isExecuting = true;

            this.results = [];
            let workspace = this.getWorkspace();
            for ( this.activeIndex=0; this.activeIndex<this.directives.length; this.activeIndex++ ) {
                let result = {success:null,message:'',testcases:[]};
                let directive = this.directives[this.activeIndex];
                result.directive = directive;
                this.results.push(result);

                await workspace.openDirective(directive);
                await Common.msleep(500);
                result = await workspace.execute();
                result.directive = directive;
                this.results.splice(this.activeIndex, 1, result);
                
                this.duration = (new Date()).getTime() - startTime;
                let container = this.$refs.resultListContainer;
                this.$nextTick(() => container.scrollTop = container.scrollHeight);
            }
            
            this.duration = (new Date()).getTime() - startTime;
            this.isExecuting = false;
        },

        /**
         * event handler to close model
         */
        actionClose() {
            this.enable = false;
        },

        /**
         * format as duration
         * @returns {String}
         */
        formatDuration(h, value) {
            return Formatter.asDurationMS(this.duration);
        },
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        /**
         * execute all testcases
         * @public 
         */
        async execute() {
            // setup batch env
            this.executeAll.modalEnable = false;
            this.executeAll.testcaseCount = 0;
            this.executeAll.testcaseSuccessCount = 0;
            this.executeAll.testcaseErrorCount = 0;
            this.executeAll.durationString = '';
            this.executeAll.stopExecuting = false;
            this.executeAll.isExecuting = true;
            this.executeAll.startedAt = new Date();
            this.executeAll.exportor = new Exportor();

            // get all directive and execute testcase by menu item
            let menuData = this.$refs.unitEntryMenu.getMenuData();
            for ( let i=0; i<menuData.length; i++ ) {
                if ( this.isDestroying ) {
                    this.executeAll.isExecuting = false;
                    this.executeAll.stopExecuting = true;
                    return;
                }
                await this.autoExecuteTestcases(menuData[i]);
            }

            // done batch executing, calculate summary info, and display result modal.
            let duration = (new Date()).getTime() - this.executeAll.startedAt;
            duration = parseInt(duration / 1000);

            let sec = duration % 60;
            let min = (duration - sec) / 60;
            if ( 10 > sec ) {
                sec = '0' + sec;
            }
            if ( 10 > min ) {
                min = '0' + min;
            }
            this.executeAll.durationString = `${min}:${sec}`;
            this.executeAll.modalEnable = true;
            this.executeAll.isExecuting = false;
            let coms = this.$store.getters.communicators;
            for ( let comKey in coms ) {
                await coms[comKey].close();
            }

            this.$refs.unitEntryMenu.batchExecuteStoped();
            this.$forceUpdate();
        },

        /**
         * stop executing all testcases. it would not stop directly, it would 
         * stop executing after done executing current testcase and then stop 
         * alll.
         */
        stop() {
            this.executeAll.stopExecuting = true;
        },

        /**
         * close modal of batch executing summary modal
         */
        actionCloseExecuteAllSummaryModal() {
            this.executeAll.modalEnable = false;
            this.$forceUpdate();
        },

        /**
         * export test summary to report file.
         */
        async actionExecuteAllSummaryMenuExport( action ) {
            await this.executeAll.exportor.export(action.key);
            this.executeAll.modalEnable = false;
            this.$forceUpdate();
        },

        /**
         * execute testcase by menu entry
         * @param {Object} menu
         */
        async autoExecuteTestcases( menu ) {
            if ( this.executeAll.stopExecuting || this.isDestroying ) {
                return;
            }

            let entries  = this.$refs.unitEntryMenu;
            if ( "folder" == menu.type ) {
                entries.menuExpandedKeyAdd(menu.key);
                for ( let i=0; i<menu.children.length; i++ ) {
                    await this.autoExecuteTestcases(menu.children[i]);
                }
            } else {
                entries.directiveTestStatusUpdate(menu.key, 'testing');
                let directive = entries.getDirectiveByEntryKey(menu.key);
                this.executeAll.exportor.logDirective(directive);
                await this.actionDirectiveClicked(directive);
                await this.$nextTick();
                let isPassed = await this.actionExecCasesOfThisDirective();
                await Common.msleep(200);
                
                let status = null;
                if ( null == isPassed ) {
                    status = 'warning';
                } else {
                    status = isPassed ? 'success' : 'error';
                }
                entries.directiveTestStatusUpdate(menu.key, status);
            }
        },



        /**
         * log testcase status after executing it.
         * @param {VueComponent} testcaseRef
         * @private
         */
        executeAllLogTestcase( testcaseRef ) {
            if ( !this.executeAll.isExecuting || this.isDestroying ) {
                return;
            }

            this.executeAll.exportor.logTestcase(
                this.directive.id, 
                testcaseRef.getTestcase(),
                testcaseRef.getResult(),
                testcaseRef.getResultStatus(),
            );

            let isPassed = testcaseRef.getResultStatus() == 'success';
            this.executeAll.testcaseCount ++;
            if ( true == isPassed ) {
                this.executeAll.testcaseSuccessCount ++;
            } else if ( false == isPassed ) {
                this.executeAll.testcaseErrorCount ++;
            }
        },
    }
}
</script>