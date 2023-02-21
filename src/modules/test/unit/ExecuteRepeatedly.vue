<template>
  <a-modal v-model="enable" :closable="false" :maskClosable="false" :keyboard="false" :bodyStyle="{padding:0}">
    <!-- header -->
    <template slot="title">
      <a-row>
        <a-col :span="12" class="text-left">{{$t('test.unit.executeRepeatedly')}}</a-col>
        <a-col :span="12" class="text-right">
          <a-radio-group v-model="viewerMode" size="small" button-style="solid">
            <a-radio-button value="grid"><a-icon type="table" /></a-radio-button>
            <a-radio-button value="list"><a-icon type="menu" /></a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
    </template>

    <!-- statistic -->
    <a-row>
      <a-col :span="5" class="text-center">
        <a-statistic :title="$t('test.unit.totalCount')" :value="statistic.total" />
      </a-col>
      <a-col :span="5" class="text-center">
        <a-statistic :title="$t('test.unit.successCount')" :value="statistic.success" />
      </a-col>
      <a-col :span="5" class="text-center">
        <a-statistic :title="$t('test.unit.failedCount')" :value="statistic.failed" />
      </a-col>
      <a-col :span="7" class="text-center">
        <a-statistic :title="$t('test.unit.duration')" :value="statistic.duration" 
          :formatter="() => formatDuration(statistic.duration)"
        />
      </a-col>
    </a-row>

    <div v-if="'grid' === viewerMode" class="position-relative">
      <!-- result map -->
      <div class="result" ref="result">
        <div v-for="(result,index) in results" :key="index" 
          :data-index="index"
          :class="`item ${result.status}`" 
          :title="`${result.index} @ ${result.duration}`"
        ></div>
      </div>
    </div>
    
    <!-- result list -->
    <div v-else class="border-top" style="height:200px;">
      <virtual-list ref="result" class="h-100 overflow-y-auto"
        :keeps="30"
        :data-key="'index'"
        :data-sources="results"
        :data-component="resultItem"
        :extra-props="{}"
      />
    </div>

    <!-- footer -->
    <template slot="footer">
      <a-row>
        <a-col :span="16" class="text-left">
          {{$t('test.unit.interval')}} : <a-input-number v-model.number="interval" :min="0" :step="100"/>
          &nbsp;
          {{$t('test.unit.count')}} : <a-input-number v-model.number="count" :min="0" :step="10"/>
        </a-col>
        <a-col :span="8">
          <a-button v-if="!isExecuting" @click="actionClose">{{$t('button.cancel')}}</a-button>
          <a-button type="danger" v-if="isExecuting" :loading="isStopping" @click="actionStop">{{$t('test.buttonStop')}}</a-button>
          <a-button type="primary" v-else @click="actionStart">{{$t('test.buttonStart')}}</a-button>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script>
import Formatter from '../../../utils/Formatter.js'
import Common from '../../../utils/Common.js'
import VirtualList from 'vue-virtual-scroll-list'
import TestcaseExecutor from './TestcaseExecutor.js'
import ExecuteRepeatedlyResultItem from './ExecuteRepeatedlyResultItem.vue'
export default {
    name : 'TestUnitExecuteRepeatedly',
    components : {
        'virtual-list' : VirtualList,
    },
    data() {
        return {
            /**
             * name of viewer mode
             * @property {String}
             */
            viewerMode : 'grid',
            /**
             * instance of testcase model
             * @property {MdbTestcase|null}
             */
            testcase : null,
            /**
             * @property {Boolean}
             */
            enable : false,
            /**
             * @property {Number}
             */
            interval : 0,
            /**
             * @property {Number}
             */
            count : 0,
            /**
             * @property {Array<Boolean>}
             */
            results : [],
            /**
             * @property {Boolean}
             */
            isStopping : false,
            /**
             * @property {Boolean}
             */
            isExecuting : false,
            /**
             * @property {Object}
             */
            statistic : {},
            /**
             * @property {ExecuteRepeatedlyResultItem}
             */
            resultItem : ExecuteRepeatedlyResultItem,
        };
    },
    methods : {
        /**
         * open execution modal
         * @property {MdbTestcase} testcase
         */
        async open( testcase ) {
            this.testcase = testcase;
            await this.reset();
            this.enable = true;
        },

        /**
         * reset this data
         */
        async reset() {
            this.results = [];
            this.statistic.total = 0;
            this.statistic.success = 0;
            this.statistic.failed = 0;
            this.statistic.duration = 0;
            await this.$nextTick();
        },

        /**
         * start execution
         */
        async actionStart() {
            await this.reset();
            let startAt = (new Date).getTime();
            this.isExecuting = true;
            for ( let i=0; i<this.count || 0 == this.count; i++ ) {
                if ( this.isStopping ) {
                    break;
                }

                let isSuccess = await this.executeTestcase(i);
                this.statistic.duration = (new Date).getTime() - startAt;
                this.statistic.total ++;
                if ( isSuccess ) {
                    this.statistic.success ++;
                } else {
                    this.statistic.failed ++;
                }
            }
            await this.$store.dispatch('closeAllCommunicators');
            this.isExecuting = false;
            this.isStopping = false;
        },
        
        /**
         * execute testcase once
         * @returns {Boolean}
         */
        async executeTestcase( index ) {
            let executor = new TestcaseExecutor(this.testcase);
            await executor.execute();
            
            let result = {};
            result.index = index;
            result.status = executor.isSuccess() ? 'success' : 'failed';
            result.duration = Formatter.asDurationMS(this.statistic.duration);
            result.executor = executor;
            this.results.push(result);

            await Common.msleep(this.interval);
            await this.$nextTick();
            if ( 'grid' === this.viewerMode ) {
                let container = this.$refs.result;
                container.scrollTop = container.scrollHeight;
            } else {
                this.$refs.result.scrollToBottom();
            }

            return executor.isSuccess();
        },
        
        /**
         * stop executing
         */
        actionStop() {
            this.isStopping = true;
        },

        /**
         * close the modal
         */
        actionClose() {
            this.enable = false;
        },

        /**
         * format as duration
         * @returns {String}
         */
        formatDuration(value) {
            return Formatter.asDurationMS(value);
        },
    },
}
</script>
<style scoped>
.result {width: 100%;height: 200px;background: #f2f2f2;line-height: 10px;overflow-y: auto;}
.result::-webkit-scrollbar{width:0;}
.item {display: inline-block;height: 10px;width: 10px;border: solid 1px white;}
.item.success {background: green;}
.item.failed {background: yellow;}
</style>