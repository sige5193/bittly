<template>
  <a-modal v-model="enable" :title="$t('test.unit.executeRepeatedly')" 
    :closable="false" :maskClosable="false" :keyboard="false" :bodyStyle="{padding:0}"
  >
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

    <!-- result map -->
    <div class="result" ref="result">
      <div v-for="(result,index) in results" :key="index" 
        :class="`item ${result.status}`" 
        :title="`${result.index} @ ${result.duration}`"
      ></div>
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
          <a-button type="danger" v-if="isExecuting" @click="actionStop">{{$t('test.buttonStop')}}</a-button>
          <a-button type="primary" v-else @click="actionStart">{{$t('test.buttonStart')}}</a-button>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script>
import Formatter from '../../../utils/Formatter.js'
import Common from '../../../utils/Common.js'
import MyDate from '../../../utils/datatype/MyDate.js';
export default {
    name : 'TestUnitExecuteRepeatedly',
    data() {
        return {
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
             * @property {componment}
             */
            executor : null,
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
        };
    },
    methods : {
        /**
         * open execution modal
         */
        open( executor ) {
            this.executor = executor;
            this.reset();
            this.enable = true;
        },

        /**
         * reset this data
         */
        reset() {
            this.results = [];
            this.statistic.total = 0;
            this.statistic.success = 0;
            this.statistic.failed = 0;
            this.statistic.duration = 0;
        },

        /**
         * start execution
         */
        async actionStart() {
            this.reset();
            let startAt = (new Date).getTime();
            this.isExecuting = true;
            for ( let i=0; i<this.count || 0 == this.count; i++ ) {
                if ( this.isStopping ) {
                    break;
                }
                
                this.statistic.total ++;
                let isSuccess = await this.executor.executeQuietly();
                if ( isSuccess ) {
                    this.statistic.success ++;
                } else {
                    this.statistic.failed ++;
                }
                
                this.statistic.duration = (new Date).getTime() - startAt;
                this.results.push({
                    index : i,
                    status : isSuccess ? 'success' : 'failed',
                    duration : Formatter.asDurationMS(this.statistic.duration),
                });
                this.$forceUpdate();
                await Common.msleep(this.interval);
                
                let container = this.$refs.result;
                this.$nextTick(() => container.scrollTop = container.scrollHeight);
            }
            await this.$store.dispatch('closeAllCommunicators');
            this.isExecuting = false;
            this.isStopping = false;
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