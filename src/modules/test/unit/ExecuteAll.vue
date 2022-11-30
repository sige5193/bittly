<template>
  <a-modal v-model="enable" :closable="false" :maskClosable="false" :keyboard="false" :width="800"
    :title="$t('test.testcaseExecuteSummaryTitle')"
  >
    <!-- summary -->
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
        <a-statistic :title="$t('test.duration')" :value="duration" 
          :formatter="() => formatDuration(duration)" class="demo-class" 
        />
      </a-col>
    </a-row>

    <!-- progress -->
    <div class="mt-3">
      <a-progress :percent="progressPercent" :status="progressStatus"/>
    </div>

    <!-- results -->
    <div ref="resultListContainer" class="mt-3 overflow-y-auto border rounded" style="max-height:300px;">
      <a-collapse v-model="activeResultCollapse">
        <a-collapse-panel v-for="(result,rindex) in results" :key="`${rindex}`"
          class="test-functional-execall-task-collapse-panel"
          :class="{success:result.success==true,failed:result.success==false}"
          :header="result.directive.name"
        >
          <a-descriptions :column="2">
            <a-descriptions-item :label="$t('test.execStatus')">
              <a-tag v-if="true === result.success" color="green">{{$t('test.testcaseExecuteStatusPass')}}</a-tag>
              <a-tag v-else-if="false === result.success" color="red">{{$t('test.testcaseExecuteStatusNotPass')}}</a-tag>
              <a-icon v-else type="loading" />
            </a-descriptions-item>
            <a-descriptions-item :label="$t('test.duration')">{{result.duration}}ms</a-descriptions-item>
          </a-descriptions>
          <a-icon v-if="null === result.success" slot="extra" type="loading" />
          
          <ul class="p-3" v-if="0 < result.testcases.length">
            <li v-for="(detail,tindex) in result.testcases" :key="tindex">
              <a-icon v-if="detail.success" type="check-circle" style="color:green;"/>
              <a-icon v-else type="close-circle" style="color:red;"/>
              {{detail.testcase.title}} 
              <a-icon v-if="!isExecuting" class="cursor-pointer" 
                type="export" @click="actionGotoTestcaseByResultIndex(rindex,tindex)"
              />
            </li>
          </ul>
        </a-collapse-panel>
      </a-collapse>
    </div>

    <template slot="footer">
      <a-row>
        <a-col :span="12" class="text-left">
          <a-checkbox v-model="enableStopOnError">{{$t('test.stopOnError')}}</a-checkbox>
        </a-col>
        <a-col :span="12">
          <a-button ref="btnClose" v-if="!isExecuting" @click="actionClose">{{$t('button.cancel')}}</a-button>
          <a-button ref="btnStart" type="primary" 
            :disabled="isExecuting" :loading="isExecuting"
            @click="actionStart"
          >{{$t('test.buttonStart')}}</a-button>
        </a-col>
      </a-row>
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
            /**
             * @property {String}
             */
            progressStatus : null,
            /**
             * @property {Boolean}
             */
            enableStopOnError : false,
            /**
             * @property {Array<String>}
             */
            activeResultCollapse : [],
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
            this.reset();
            this.enable = true;
        },

        /**
         * reset the modal
         */
        reset() {
            this.isExecuting = false;
            this.activeIndex = 0;
            this.progressStatus = null;
            this.results = [];
            this.duration = 0;
        },

        /**
         * start to execute all testcases
         */
        async actionStart() {
            this.reset();
            let startTime = (new Date()).getTime();
            this.isExecuting = true;
            this.progressStatus = 'success';
            
            let workspace = this.getWorkspace();
            for ( this.activeIndex=0; this.activeIndex<this.directives.length; this.activeIndex++ ) {
                this.activeResultCollapse = [this.activeIndex];

                let result = {success:null,message:'',testcases:[]};
                let directive = this.directives[this.activeIndex];
                result.directive = directive;
                this.results.push(result);

                await workspace.openDirective(directive);
                await Common.msleep(300);
                result = await workspace.execute();
                result.directive = directive;
                this.results.splice(this.activeIndex, 1, result);
                if ( false === result.success ) {
                    this.progressStatus = 'exception';
                }
                this.duration = (new Date()).getTime() - startTime;
                
                let container = this.$refs.resultListContainer;
                this.$nextTick(() => container.scrollTop = container.scrollHeight);
                if ( false === result.success && this.enableStopOnError ) {
                    break;
                }
            }
            
            this.duration = (new Date()).getTime() - startTime;
            await this.$store.dispatch('closeAllCommunicators');
            this.isExecuting = false;
        },

        /**
         * event handler to close model
         */
        async actionClose() {
            await this.close();
        },

        /**
         * open test by given result index.
         * @param {Number} resultIndex
         * @param {Number} testcaseIndex
         */
        async actionGotoTestcaseByResultIndex(resultIndex, testcaseIndex) {
            let result = this.results[resultIndex];
            let directive = result.directive;
            let testcase = result.testcases[testcaseIndex].testcase;
            
            let workspace = this.getWorkspace();
            await workspace.openDirective(directive);
            workspace.expandTestcaseById(testcase.id);
            await this.close();
        },

        /**
         * close this modal
         */
        async close() {
            await this.$store.dispatch('closeAllCommunicators');
            this.enable = false;
        },

        /**
         * format as duration
         * @returns {String}
         */
        formatDuration(value) {
            return Formatter.asDurationMS(value);
        },
    }
}
</script>