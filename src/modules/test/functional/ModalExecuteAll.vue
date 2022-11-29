<template>
  <a-modal v-model="visible" 
    :title="$t('test.functional.executeAll')" 
    :closable="false" 
    :maskClosable="false"
    :keyboard="false"
  >
    <a-row>
      <a-col :span="8">
        <a-statistic :title="$t('test.functional.executeAllCurIndex')" :value="activeIndex">
          <template #suffix><span> / {{testcases.length}}</span></template>
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
          :header="result.testcase.title"
        >
          <a-descriptions :column="2">
            <a-descriptions-item :label="$t('test.execStatus')">
              <a-tag v-if="result.success" color="green">{{$t('test.testcaseExecuteStatusPass')}}</a-tag>
              <a-tag v-else color="red">{{$t('test.testcaseExecuteStatusNotPass')}}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item :label="$t('test.duration')">{{result.duration}}ms</a-descriptions-item>
            <a-descriptions-item v-if="0 != result.message.length" :label="$t('test.message')" :span="2">
              {{result.message}}
            </a-descriptions-item>
          </a-descriptions>
          <a-icon v-if="null === result.success" slot="extra" type="loading" />
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
import Formatter from '../../../utils/Formatter.js'
import Common from '../../../utils/Common.js'
import MdbFunctionalTestcase from '../../../models/MdbFunctionalTestcase.js'
export default {
    naem : 'TestFunctionalExecuteAllModal',
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
            visible : false,
            /**
             * @property {Array<MdbFunctionalTestcase>}
             */
            testcases : [],
            /**
             * @property {Number}
             */
            activeIndex : 0,
            /**
             * @property {Array<Object>}
             */
            results : [],
            /**
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * @property {Number}
             */
            duration : 0,
        }
    },
    computed : {
        progressPercent() {
            return Math.round(this.activeIndex / this.testcases.length * 100);
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
                if ( !this.results[i].success ) {
                    count ++;
                }
            }
            return count;
        },
    },
    methods : {
        /**
         * open execute all modal and prepare to execute
         */
        async open() {
            this.duration = 0;
            this.activeIndex = 0;
            this.results = [];
            this.testcases = [];
            let projectId = this.$store.getters.projectActivedId;
            this.testcases = await MdbFunctionalTestcase.findAll({project_id:projectId});
            this.testcases.sort((itemA,itemB ) => itemA.title.localeCompare(itemB.title));
            this.visible = true;
        },

        /**
         * event handler on start button clicked.
         */
        async actionStart() {
            let startTime = (new Date()).getTime();
            this.duration = 0;
            this.isExecuting = true;

            this.results = [];
            let workspace = this.getWorkspace();
            for ( this.activeIndex=0; this.activeIndex<this.testcases.length; this.activeIndex++ ) {
                let result = {success:null,message:''};
                let testcase = this.testcases[this.activeIndex];
                result.testcase = testcase;
                this.results.push(result);

                workspace.openTestcase(testcase);
                await Common.msleep(500);
                result = await workspace.execute();
                result.testcase = testcase;
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
            this.visible = false;
        },

        /**
         * format as duration
         * @returns {String}
         */
        formatDuration(h, value) {
            return Formatter.asDurationMS(this.duration);
        }
    },
}
</script>
<style>
.test-functional-execall-task-collapse-panel .ant-collapse-header {padding: 5px 40px !important;}
.test-functional-execall-task-collapse-panel.success .ant-collapse-header {background: #ecfee4 !important;}
.test-functional-execall-task-collapse-panel.failed .ant-collapse-header {background: #ffe7e9 !important;}
</style>