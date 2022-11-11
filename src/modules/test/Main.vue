<template>
  <a-layout class="h-100">
    <!-- menu entry -->
    <a-layout-sider class="bg-white border-right" width="300">
      <directive-entries
        ref="entries"
        :projectId="curProjectId"
        @directive-click="actionDirectiveClicked"
        @execute-all-testcases="actionExecuteAllTestcases"
        @execute-all-testcases-stop="actionExecuteAllTestcasesStop"
      ></directive-entries>
      <modal-testcase-edit ref="modalTestcaseEdit"></modal-testcase-edit>
    </a-layout-sider>
    
    <!-- no active directive -->
    <a-layout-content v-if="null == directive" class="h-100 bg-white pt-5">
      <a-empty :description="false" />
    </a-layout-content>

    <a-layout-content v-if="null != directive" class="bg-white p-2">
      <a-page-header style="border: 1px solid rgb(235, 237, 240)" :title="directive.name">
        <template slot="extra">
          <a-button 
            :disabled="executeAll.isExecuting"
            @click="actionCreateNewTestcase"
          >{{$t('test.editModal.createNewTestcase')}}</a-button>
          <a-button 
            type="primary" 
            :loading="isExecuting"
            :disabled="isExecuting || executeAll.isExecuting"
            @click="actionExecCasesOfThisDirective"
          >{{$t('button.execute')}}</a-button>
        </template>
      </a-page-header>
      
      <!-- testcase list -->
      <div>
        <a-empty v-if="0 == testcases.length" :description="false" class="mt-5" />
        <block-testcase 
          ref="testcase"
          v-for="(testcase,index) in testcases" 
          :key="index"
          :index="index"
          :testcase="testcase"
          :directive="directive"
          @testcase-delete="actionTestcaseDelete"
        ></block-testcase>
      </div>
    </a-layout-content>

    <!-- batch execute result summary modal -->
    <a-modal
      :title="$t('test.testcaseExecuteSummaryTitle')"
      v-if="executeAll.modalEnable"
      :visible="executeAll.modalEnable"
    >
      <p>{{$t('test.testcaseExecuteSummaryTotalCount')}} : {{executeAll.testcaseCount}}</p>
      <p>
        {{$t('test.testcaseExecuteSummaryStatusCount')}} : 
        <a-tag color="green">{{$t('test.testcaseExecuteStatusPass')}} : {{executeAll.testcaseSuccessCount}}</a-tag>  
        <a-tag color="red">{{$t('test.testcaseExecuteStatusNotPass')}} : {{executeAll.testcaseErrorCount}}</a-tag>
      </p>
      <p>{{$t('test.testcaseExecuteSummaryDuration')}} : {{executeAll.durationString}}</p>
      <template slot="footer">
        <a-button @click="actionCloseExecuteAllSummaryModal">{{$t('button.close')}}</a-button>
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay" @click="actionExecuteAllSummaryMenuExport">
            <a-menu-item key="html">HTML</a-menu-item>
            <a-menu-item key="excel">Excel</a-menu-item>
          </a-menu>
          <a-button type="primary" style="margin-left: 8px"> {{$t('test.exportTestReport')}} <a-icon type="down" /> </a-button>
        </a-dropdown>
      </template>
    </a-modal>

  </a-layout>
</template>
<script>
import Exportor from './export/Exportor.js'
import ModalTestcaseEdit from './ModalTestcaseEdit.vue'
import MdbTestcase from '../../models/MdbTestcase.js'
import ProjectMixin from '../../utils/ProjectMixin.js'
import Common from '../../utils/Common.js'
import DirectiveEntries from './DirectiveEntries.vue'
import TestcaseBlock from './Testcase.vue'
export default {
    name : 'TestMain',
    mixins : [ProjectMixin],
    components : {
        'directive-entries' : DirectiveEntries,
        'modal-testcase-edit' : ModalTestcaseEdit,
        'block-testcase' : TestcaseBlock,
    },
    data() {
        return {
            /**
             * indicate if user leaving test module
             * @property {Boolean}
             */
            isDestroying : false,
            directive : null,
            testcases : [],
            testResults : [],
            isExecuting : false,
            executeAll : { 
                modalEnable : false, 
                isExecuting : false,
            },
        };
    },
    beforeDestroy() {
        this.isDestroying = true;
    },
    methods : {
        /**
         * event handler on directive entry meny item clicked
         * @param {MdDirective} directive
         */
        async actionDirectiveClicked( directive ) {
            this.directive = directive;
            await this.refreshTestcaseList();
        },

        /**
         * refresh testcase list of current directive
         */
        async refreshTestcaseList() {
            this.testcases = [];
            this.testResults = [];
            this.testcases = await MdbTestcase.findAll({
                directive_id : this.directive.id,
            });
        },

        /**
         * execute all testcases
         */
        async actionExecuteAllTestcases() {
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
            let menuData = this.$refs.entries.getMenuData();
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

            this.$refs.entries.batchExecuteStoped();
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

            let entries  = this.$refs.entries;
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
         * stop executing all testcases. it would not stop directly, it would 
         * stop executing after done executing current testcase and then stop 
         * alll.
         */
        actionExecuteAllTestcasesStop() {
            this.executeAll.stopExecuting = true;
        },

        /**
         * create new testcase
         */
        async actionCreateNewTestcase() {
            try {
                await this.$refs.modalTestcaseEdit.open(this.directive);
                this.refreshTestcaseList();
            } catch {
                return;
            }
        },

        /**
         * execute all the testcases of current directive
         */
        async actionExecCasesOfThisDirective() {
            if ( 0 >= this.testcases.length ) {
                return null;
            }

            this.isExecuting = true;
            let isAllPassed = true;
            let testcases = this.$refs.testcase;
            for ( let i=0; i<testcases.length; i++ ) {
                if ( this.isDestroying 
                || (this.executeAll.isExecuting && this.executeAll.stopExecuting)
                ) {
                    isAllPassed = false;
                    break;
                }
                let isPassed = await testcases[i].execute();
                isAllPassed = isAllPassed && isPassed;

                this.executeAllLogTestcase(testcases[i]);
            }
            this.isExecuting = false;
            return isAllPassed;
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

        /**
         * event handler of testcase deleting
         * @param {Number} index
         */
        actionTestcaseDelete( index ) {
            this.testcases.splice(index, 1);
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
    },
}
</script>