<template>
  <div ref="viewer" class="viewer flex-grow h-0 overflow-auto">
    <a-empty 
        class="mt-5 mb-5" 
        v-if="0 == datalog.length" 
        :description="$t('app.toolTcpServer.noData')"
    />
    <a-timeline v-else>
      <a-timeline-item v-for="(data, dIndex) in datalog" :key="dIndex" class="p-0">
        <a-icon v-if="'receive' == data.dir" slot="dot" type="left-circle" style="font-size: 10px;" />
        <a-icon v-if="'send' == data.dir" slot="dot" type="right-circle" style="font-size: 10px;" />
        <small class="mb-1">
          {{data.time | dataTime}}
          {{data.content.length}}B
          <span v-if="data.note">[{{data.note}}]</span>
        </small>
        <a-dropdown :trigger="['contextmenu']">
          <pre :class="`p-1 mb-1 data-content ${data.dir}`">{{formatDataContent(data)}}</pre>
          <a-menu slot="overlay" @click="actionDataItemContextMenuItemClicked">
            <a-menu-item key="ClearAll"><a-icon type="border" /> {{$t('button.clearAll')}}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-timeline-item>
    </a-timeline>
  </div>
</template>
<script>
import Common from '../../../utils/Common.js'
import MyDate from '../../../utils/datatype/MyDate.js'
export default {
    name : 'ToolUtilsMockServerDataViewer',
    props : {
        /**
         * @property {String}
         */
        viewmode : {},
        /**
         * @property {Boolean}
         */
        enableDataMerge : {},
        /**
         * @property {String}
         */
        clientKey : {},
    },
    data() {
        return {
            viewerSize : 50,
            datalog : [],
            dataSizeSend : 0,
            dataSizeReceive : 0,
        };
    },
    filters : {
        /**
         * @param {Date} time
         */
        dataTime( time ) {
            return MyDate.formatAsDateTimeDotMs(time);
        },
    },
    methods : {
        /**
         * record received data
         * @public
         */
        dataReceive ( data ) {
            this.dataSizeReceive += data.length;

            let lastDataLog = null;
            if ( 0 < this.datalog.length ) {
                lastDataLog = this.datalog[this.datalog.length - 1];
            }

            let shouldMerge = this.enableDataMerge && null != lastDataLog;
            shouldMerge = shouldMerge && 'receive' == lastDataLog.dir;
            shouldMerge = shouldMerge && ((new Date()).getTime() - lastDataLog.time.getTime()) < 500;
            if ( shouldMerge ) {
                lastDataLog.content = Buffer.concat([lastDataLog.content, Buffer.from(data)]);
            } else {
                this.datalog.push({
                    dir : 'receive',
                    content : Buffer.from(data),
                    time : new Date(),
                });

                if ( this.viewerSize < this.datalog.length ) {
                    this.datalog.shift();
                }
            }
            
            this.$forceUpdate();
            this.$nextTick(() => this.scrollToBottom());
            this.$emit('data-size-receive-changed', this.dataSizeReceive, this.clientKey);
        },

        /**
         * record send data
         * @public
         * @param {Buffer} data
         */
        dataSend( data, note ) {
            this.dataSizeSend += data.length;
            this.datalog.push({
                dir : 'send',
                content : data,
                time : new Date(),
                note : note,
            });
            if ( this.viewerSize < this.datalog.length ) {
                this.datalog.shift();
            }
            this.$forceUpdate();
            this.$nextTick(() => this.scrollToBottom());
            this.$emit('data-size-send-changed', this.dataSizeSend, this.clientKey);
        },

        /**
         * reset send size
         */
        dataSizeSendReset() {
            this.dataSizeSend = 0;
            this.$emit('data-size-send-changed', this.dataSizeSend, this.clientKey);
        },

        /**
         * reset receive size
         */
        dataSizeReceiveReset() {
            this.dataSizeReceive = 0;
            this.$emit('data-size-receive-changed', this.dataSizeReceive, this.clientKey);
        },

        /**
         * scroll data viewer to bottom
         * @param {String} key
         */
        scrollToBottom() {
            let elem = this.$refs.viewer;
            elem.scrollTop = elem.scrollHeight
        },

        /**
         * format data to viewer
         * @param {Buffer} data
         * @returns {String}
         */
        formatDataContent( data ) {
            if ( 'hex' == this.viewmode ) {
                let value = [];
                for ( let i=0; i<data.content.length; i++ ) {
                    let byte = data.content[i];
                    let byteStr = byte.toString(16);
                    if ( 1 == byteStr.length ) {
                        byteStr = `0${byteStr}`;
                    }
                    value.push(byteStr.toUpperCase());
                    value.push(' ');
                }
                return value.join('').trim();
            } else {
                let content = data.content;
                return Common.charsetConvert(content, 'utf8', this.charset);
            }
        },

        /**
         * event handler on data item context menu item clicked
         * @param {Event} event
         */
        actionDataItemContextMenuItemClicked( event ) {
            let handler = `handleDataViewerDataItemContextMenuItem${event.key}`;
            this[handler]();
        },
        
        /**
         * clear data viewer content
         */
        handleDataViewerDataItemContextMenuItemClearAll() {
            this.datalog = [];
        },

        /**
         * reset the viewer
         */
        reset() {
            this.datalog = [];
            this.dataSizeSend = 0;
            this.dataSizeReceive = 0;
        },
    },
}
</script>
<style scoped>
.viewer {padding-right: 5px;height: 100% !important;overflow: auto !important;}
.viewer::-webkit-scrollbar {width: 6px;height: 6px;}
.viewer::-webkit-scrollbar-track { background: none; }
.viewer::-webkit-scrollbar-track-piece {opacity: 0;}
.viewer::-webkit-scrollbar-thumb {border-radius: 3px;background: rgba(92, 110, 130, 0.6);}
.data-content {white-space: pre-wrap; word-wrap: break-word;user-select: text;}
.data-content.receive {background: #eaeaea;color: #5c5c5c;}
.data-content.send {background: #e6f7ff;color: #666666;}
</style>