<template>
  <div class="h-100 d-flex flex-dir-column">
    <!-- content editor -->
    <div class="flex-grow">
      <a-textarea class="h-100 content-editor" v-model="content"></a-textarea>
    </div>
    
    <!-- toolbar -->
    <div class="border-top p-1 text-right">
      <a-popover trigger="click" v-if="0 < historyItems.length" v-model="historyVisible">
        <template slot="content">
          <div style="width:300px;max-height: 500px;overflow-y: auto;">
            <div v-for="(historyItem, historyItemIndex) in historyItems" 
              :key="historyItemIndex"
              class="d-flex flex-dir-row bg-light mb-1 p-1 history-item"
            >
              <div class="flex-grow" @click="actionHistoryItemClick(historyItemIndex)"
              >{{historyItem.content}}</div>
              <a-icon type="delete" class="cursor-pointer d-block" 
                @click="actionHistoryItemDelete(historyItemIndex)"
              />
            </div>
          </div>
        </template>
        <a-button size="small" class="mr-1"> {{$t('mock.response.manual.history')}} <a-icon type="up" /> </a-button>
      </a-popover>
      <a-radio-group v-model="handler" size="small" class="mr-1">
        <a-radio-button value="Text">TEXT</a-radio-button>
        <a-radio-button value="Hex">HEX</a-radio-button>
      </a-radio-group>
      <a-select size="small" class="mr-1" style="width:70px;" v-model="newlineStyle">
        <a-select-option value="CRLF">CRLF</a-select-option>
        <a-select-option value="CR">CR</a-select-option>
        <a-select-option value="LF">LF</a-select-option>
      </a-select>
      <a-button size="small" @click="actionSend">{{$t('button.send')}}</a-button>
    </div>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    name : 'MockResponseManualEditor',
    props : {
        /**
         * options for manual editor
         * @property {Object}
         */
        value : {type:Object}
    },
    data() {
        return {
            /**
             * content of editor
             * @property {String}
             */
            content : '',
            /**
             * new line style for text mode
             * @property {String}
             */
            newlineStyle : 'CRLF',
            /**
             * type of content generator
             * @property {String}
             */
            handler: 'Text',
            /**
             * list of history items
             * @property {Object}
             */
            historyItems : [],
            /**
             * indicate if history popover visiable
             * @property {Boolean}
             */
            historyVisible : false,
        };
    },
    created() {
        if ( undefined === this.value ) {
            this.actionUpdateVModel();
            return ;
        }

        this.content = this.value.content;
        this.newlineStyle = this.value.newlineStyle;
        this.handler = this.value.handler;
        this.historyItems = this.value.historyItems;
    },
    methods : {
        /**
         * push entry item to history
         * @param {Object} entry
         */
        pushEntryToHistory( entry ) {
            if ( 0 == entry.content.length ) {
                return ;
            }

            for ( let i=0; i<this.historyItems.length; i++ ) {
                if ( this.historyItems[i].content == this.content ) {
                    this.historyItems.splice(i, 1);
                    break;
                }
            }

            this.historyItems.push(MyObject.copy(entry));
            if ( this.historyItems.length > 20 ) {
                this.historyItems.shift();
            }

            this.actionUpdateVModel();
        },
        
        /**
         * send content to client
         */
        actionSend() {
            if ( 0 === this.content.length ) {
                this.$message.error(this.$t('mock.response.manual.contentCanNotBeEmpty'));
                return ;
            }

            let entry = {};
            entry.name = this.$t('mock.response.manual.title');
            entry.handler = this.handler;
            entry.mode = this.handler.toLowerCase();
            entry.content = this.content;
            entry.nlstyle = this.newlineStyle;
            this.pushEntryToHistory(entry);
            this.$emit('send',entry);
        },
        
        /**
         * delete history item by given index
         * @param {Number} index
         */
        actionHistoryItemDelete(index) {
            this.historyItems.splice(index, 1);
            this.actionUpdateVModel();
        },

        /**
         * active history item
         */
        actionHistoryItemClick(index) {
            let item = this.historyItems[index];
            this.handler = item.handler;
            this.content = item.content;
            this.newlineStyle = item.nlstyle;
            this.historyVisible = false;
            this.actionUpdateVModel();
        },

        /**
         * update v-model
         */
        actionUpdateVModel() {
            let newValue = {};
            newValue.content = this.content;
            newValue.newlineStyle = this.newlineStyle;
            newValue.handler = this.handler;
            newValue.historyItems = this.historyItems;
            this.$emit('input', newValue);
            this.$emit('change');
        }
    },
}
</script>
<style scoped>
.history-item {user-select: none;}
.history-item:hover {background: white !important;}
.content-editor {border-radius: 0;border: none;outline: none;}
.content-editor:focus {outline: none;box-shadow: none;}
</style>