<template>
  <div class="d-inline-block">
    <a-badge :count="newMessageCount" :numberStyle="{fontSize:'10px',height:'16px',lineHeight:'16px'}">
      <a-icon ref="iconMessage" class="cursor-pointer ml-2" type="message" @click="actionShow"/>
    </a-badge>
    
    <!-- chat dialog -->
    <a-modal v-if="enable"
      ref="modalChat"
      v-model="enable" 
      :title="$t('app.feedback.title')" 
      :bodyStyle="{padding:0}" 
      :footer="null" 
      @cancel="actionCancel"
    >
      <!-- messages -->
      <div ref="messages-block" class="message-container">
        <div v-for="(message, mindex) in messages" :key="mindex" class="mt-2">
          <template v-if="'bittly' === message.source">
            <div class="text-muted text-small">{{formatMessageTime(message.time)}}</div>
            <div>
              <div class="message-content-bittly">
                <span v-if="'text' == message.type">{{message.content}}</span>
                <img v-if="'image' == message.type" :src="`data:image/png;base64,${message.content}`" height="128">
              </div>
            </div>
          </template>
          <template v-if="'user' === message.source">
            <div class="text-muted text-small text-right">{{formatMessageTime(message.time)}}</div>
            <div class="text-right">
              <div class="message-content-user">
                <span v-if="'text' == message.type">{{message.content}}</span>
                <img v-if="'image' == message.type" :src="`data:image/png;base64,${message.content}`" height="128">
              </div>
            </div>
          </template>
        </div>
      </div>

      <div>
        <!-- toolbar -->
        <div>
          <a-button ref="btnSendImg" class="border-none" @click="actionToolbarImageClicked"><a-icon type="picture" /></a-button>
        </div>

        <!-- message textarea -->
        <a-textarea 
          ref="txtMessage"
          class="txt-message-content border-none" 
          v-model="txtMessage"
          :placeholder="$t('app.feedback.textMessageInputPlaceholder')" 
          :rows="3"
          @pressEnter="actionTxtMessageContentPressEnter" 
        />
      </div>
    </a-modal>
  </div>
</template>
<script>
import MdbRuntimeVariable from '../models/MdbRuntimeVariable';
import Formatter from '../utils/Formatter';
export default {
    name : 'AppFeedback',
    props : {
        /**
         * message count to display in modal
         * @property {Number}
         */
        messageLimit : {default:100},
        /**
         * frequency of message pulling at background.
         * @property {Number}
         */
        bgPullFrequencyDefault : {default:1000*60},
    },
    data() {
        return {
            /**
             * id of feedback session.
             * @property {String}
             */
            sid : '',
            /**
             * enable to message dialog or not
             * @property {Boolean}
             */
            enable : false,
            /**
             * list of messages
             * @property {Array<Object>}
             */
            messages : [],
            /**
             * text message to send
             * @property {String}
             */
            txtMessage : '',
            /**
             * time of frequency to pull messages at frontend
             * @property {Number}
             */
            pullFrequency : 3000,
            /**
             * the timer id of puller in background.
             * @property {Number}
             */
            bgPullTimer : null,
            /**
             * time of frequency to pull messages at background.
             * @property {Number}
             */
            bgPullFrequency : 1000 * 60,
            /**
             * each time we pulling for 10 times, we double the frequency.
             * @property {Number}
             */
            bgPullTimerCountdown : 10,
            /**
             * the message count that recived.
             * @property {Number}
             */
            newMessageCount : 0,
        };
    },
    async mounted() {
        await this.init();
    },
    /**
     * clean the pulling timer.
     */
    beforeDestroy() {
        if ( null != this.bgPullTimer ) {
            clearTimeout(this.bgPullTimer);
        }
    },
    methods : {
        /**
         * init component
         */
        async init(){
            this.bgPullFrequency = this.bgPullFrequencyDefault;
            this.sid = await MdbRuntimeVariable.getVarValue('feedback_sid', '');
            this.$eventBus.$on('menu-help-feedback-clicked', () => this.actionShow());
            let messages = await MdbRuntimeVariable.getVarValue('feedback_messages', '[]');
            this.messages = JSON.parse(messages);
            for ( let i=0; i<this.messages.length; i++ ) {
                this.messages[i].time = new Date(this.messages[i].time);
            }
            this.backgroundPull();
        },

        /**
         * pull messages at background, bgpuller would not work if front puller 
         * is working.
         */
        async backgroundPull() {
            this.bgPullTimer = null;
            if ( this.enable || '' === this.sid ) {
                return ;
            }

            let pull = await this.$bittly.feedbackPull(this.sid);
            if ( !pull.success ) {
                this.bgPullTimer = null;
                return ;
            }
            
            if ( pull.data.length > 0 ) {
                await this.processNewMessages(pull.data);
                this.newMessageCount += pull.data.length;
                this.bgPullFrequency = this.bgPullFrequencyDefault;
                this.bgPullTimerCountdown = 10;
            } else {
                this.bgPullTimerCountdown --;
                if ( 0 >= this.bgPullTimerCountdown ) {
                    this.bgPullTimerCountdown = 10;
                    this.bgPullFrequency *= 2;
                }
            }

            this.bgPullTimer = setTimeout(() => this.backgroundPull(), this.bgPullFrequency);
        },

        /**
         * process new message from server
         * @param {Array<Object>} messages
         */
        async processNewMessages( messages ) {
            for ( let i=0; i<messages.length; i++ ) {
                let message = messages[i];
                message.time = new Date(message.created_at);
                this.messages.push(message);
                if ( this.messageLimit < this.messages.length ) {
                    this.messages.shift();
                }
            }
            await MdbRuntimeVariable.setVarValue('feedback_messages', JSON.stringify(this.messages));
            this.$forceUpdate();
        },

        /**
         * send message to server
         * @param {Object} message the message object
         * - content : {String} message content
         * - type : {String} 'text'|'image'
         */
        async send( message ) {
            message.time = new Date();
            message.source = 'user';
            message.sid = this.sid;
            let send = await this.$bittly.feedbackSend(message);
            if ( !send.success ) {
                this.$message.error(this.$t('app.feedback.messageSendFailed', [send.message]));
                return ;
            }

            this.messages.push(message);
            if ( this.messageLimit < this.messages.length ) {
                this.messages.shift();
            }
            await MdbRuntimeVariable.setVarValue('feedback_messages', JSON.stringify(this.messages));

            let messageContainer = this.$refs['messages-block'];
            this.$nextTick(() => messageContainer.scrollTop = messageContainer.scrollHeight);

            if ( '' == this.sid ) {
                this.sid = send.data.sid;
                await this.pull();
                await MdbRuntimeVariable.setVarValue('feedback_sid',this.sid);
            }
        },

        /**
         * send text message on user input enter
         * @param {Event} event
         */
        async actionTxtMessageContentPressEnter( event ) {
            event.preventDefault();

            if ( '' === this.txtMessage ) {
                this.$message.error(this.$t('app.feedback.messageSendFailedEmpty'));
                return;
            }

            let message = {};
            message.content = this.txtMessage;
            message.type = 'text';
            await this.send(message);
            this.txtMessage = '';
        },

        /**
         * send image message
         */
        async actionToolbarImageClicked() {
            let path = await window.dialog.showOpenDialogSync({
                filters:[{name:this.$t('app.feedback.imageFileSelectFilterName'),extensions:['jpg','png']}],
            });
            if ( undefined === path ) {
                return;
            }
            
            let $this = this;
            path = path[0];
            window.fs.readFile(path, function( err, data ) {
                if (err) {
                    $this.$message.error($this.$t('app.feedback.imageOpenFailed'));
                    return;
                }

                let message = {};
                message.content = data.toString('base64');
                message.type = 'image';
                $this.send(message);
            });
        },

        /**
         * open message modal
         */
        actionShow() {
            this.enable = true;
            this.newMessageCount = 0;
            this.pull();

            let $this = this;
            this.$nextTick(() => {
                let messageContainer = $this.$refs['messages-block'];
                messageContainer.scrollTop = messageContainer.scrollHeight;
            });
        },

        /**
         * pull message
         */
        async pull () {
            if ( '' == this.sid || !this.enable ) {
                return ;
            }

            let pull = await this.$bittly.feedbackPull(this.sid);
            if ( !pull.success ) {
                this.$message.error(this.$t('app.feedback.messagePullFailed', [pull.message]));
                return ;
            }
            
            if ( pull.data.length > 0 ) {
                await this.processNewMessages(pull.data);
                let messageContainer = this.$refs['messages-block'];
                this.$nextTick(() => messageContainer.scrollTop = messageContainer.scrollHeight);
            }

            setTimeout(() => this.pull(), this.pullFrequency);
        },

        /**
         * close message dialog
         */
        actionCancel() {
            this.enable = false;
            this.bgPullFrequency = this.bgPullFrequencyDefault;
            this.bgPullTimerCountdown = 10;
            this.backgroundPull();
        },

        /**
         * format time to string
         * @param {Date} time
         * @returns {String}
         */
        formatMessageTime( time ) {
            return Formatter.asDataTime(time);
        },
    },
}
</script>
<style scoped>
.txt-message-content:focus {box-shadow:none;}
.message-container {padding: 5px;background: #d7d7d7;height: 300px;overflow-y: auto;}
.message-content-bittly {background: white;display:inline-block;border: solid 1px #b1b1b1;border-radius: 5px;padding: 5px;}
.message-content-user {background: #0084ff;color: #fbfbfb;display:inline-block;border: solid 1px #b1b1b1;border-radius: 5px;padding: 5px;}
</style>