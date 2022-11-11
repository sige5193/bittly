<template>
  <a-tooltip :mouseEnterDelay="0.8" :title="widget.tooltip">
    <div class="container">
      <a-icon v-if="'stoped' == status" type="history" class="text-large" />
      <div v-if="'running' == status" class="countdown-wrapper">
        <a-progress 
          type="circle" 
          :percent="downtimerProgress" 
          :width="24" 
          :strokeWidth="15" 
          :showInfo="false"
        />
      </div>
    
      <span class="text-large ml-2 mr-2">{{downtimerClock}}</span>

      <a-button 
        v-if="'stoped' == status" 
        class="act-button"
        ref="btnStart" 
        @click="actionStart"
      >
        <a-icon type="play-circle" />
      </a-button>
      <a-button v-if="'running' == status" class="act-button" @click="actionStop">
        <a-icon type="pause-circle" />
      </a-button>
    </div>
  </a-tooltip>
</template>
<script>
import Common from '../../../../utils/Common.js'
import WidgetMixin from '../WidgetRunMixin.js' 
export default {
    name : 'EditWidgetTimer',
    mixins : [WidgetMixin],
    data() {
        return {
            status : 'stoped',
            interval : this.widget.interval * 1,
            downtimer : 0,
            downcounter : this.widget.count * 1,
            downtimerProgress : 0,
            downtimerClock : '00:00',
            timerId : null,
        };
    },
    destroyed() {
        if ( null != this.timerId ) {
            clearTimeout(this.timerId);
        }
    },
    methods : {
        /**
         * start timer
         */
        actionStart() {
            this.downcounter = this.widget.count * 1;
            this.status = 'running';
            this.executeTimeout();
        },

        /**
         * stop timer
         */
        actionStop() {
            this.status = 'stoped';
            this.downcounter = 0;
            this.downtimerClock = '00:00';
        },

        /**
         * execute timer action, if error occured, the timer would stop executing.
         */
        async executeTimeout() {
            if ( 0 >= this.downtimer ) {
                this.downtimerProgress = 100;
                await Common.msleep(100);
                let isSuccess = await this.actionExecute();
                if ( !isSuccess ) {
                    this.actionStop();
                    return ;
                }
                this.downtimer = this.interval;
                this.downcounter --;
            }
            
            if ( 0 >= this.downcounter ) {
                this.actionStop();
                return;
            }

            this.downtimer --;
            this.downtimerProgress = 100 - (this.interval-this.downtimer) / this.interval * 100;
            this.downtimerClock = [
                (this.downtimer - this.downtimer % 60) / 60,
                (this.downtimer % 60),
            ];
            if ( 10 > this.downtimerClock[0] ) {
                this.downtimerClock[0] = `0${this.downtimerClock[0]}`;
            }
            if ( 10 > this.downtimerClock[1] ) {
                this.downtimerClock[1] = `0${this.downtimerClock[1]}`;
            }

            this.downtimerClock = this.downtimerClock.join(':');

            let $this = this;
            this.timerId = setTimeout(function() {
                $this.executeTimeout();
            }, 1000);
        },
    },

}
</script>
<style scoped>
.container {border: solid 1px #c7c7c7;padding: 2px 10px;border-radius: 5px;background: white;}
.countdown-wrapper {display: inline-block;vertical-align: text-bottom;}
.act-button {vertical-align: bottom;}
</style>