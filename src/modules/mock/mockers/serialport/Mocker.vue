<template>
  <div class="d-flex flex-dir-column h-100">
    <!-- data entries -->
    <div>
      <a-row class="border-bottom p-1">
        <a-col :span="12">
          <a-switch checked-children="合并数据" un-checked-children="合并数据" default-checked style="vertical-align: baseline;"/>
        </a-col>
        <a-col :span="12" class="text-right">
          <a-input addon-before="接收" value="1.23M" size="small" style="width:120px;" class="mr-1" disabled />
          <a-input addon-before="发送" value="1.23K" size="small" style="width:120px;" class="mr-1" disabled />
          <a-button size="small" class="mr-1">导出</a-button>
        </a-col>
      </a-row>
      <div class="p-2 overflow-y-auto border-bottom" style="height:300px;">
        <div ref="dataEntryList" class="h-100 overflow-y-auto" v-if="null != mocker">
          <div v-for="(entry,index) in mocker.dataEntries" :key="index" :class="`mb-1 data-entry-${entry.dir}`">
            <div><small>12:22:22.111 1byte {{entry.name}}</small></div>
            <div class="content" v-if="'Text' == entry.handler"><pre class="mb-0">{{entry.data.toString()}}</pre></div>
            <div class="content" v-else-if="'Hex' == entry.handler">
              <pre class="mb-0">{{dataEntryHexContentFormat(entry)}}</pre>
            </div>
            <div class="content" v-else-if="-1 != ['Form','Script','Random'].indexOf(entry.handler)">
              <pre class="mb-0">{{dataEntryHexContentFormat(entry)}}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- response -->
    <div class="h-0 flex-grow position-relative">
      <div class="block-separator"></div>
      <a-tabs class="d-flex flex-dir-column h-100 mock-mocker-serialport-response-tab"
        default-active-key="match" 
        :tabBarStyle="{marginBottom:'0px'}"
      >
        <a-tab-pane key="match" :tab="$t('mock.response.match.title')">
          <response-match-rule-editor 
            v-model="mock.options.responseMatchRules"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="snippet" :tab="$t('mock.response.snippet.title')">
          <response-snippet-editor 
            v-model="mock.options.responseSnippets"
            @send="actionContentSend"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="manual" :tab="$t('mock.response.manual.title')">
          <response-manual-editor 
            v-model="mock.options.responseManualEditor"
            @send="actionContentSend"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
        <a-tab-pane key="status" tab="状态">
          <status-editor
            v-model="mock.options.status"
            :mocker="mocker"
            @change="actionEditorOptionChange"
          />
        </a-tab-pane>
      </a-tabs>
    </div>

    <mocker-setting ref="setting" v-model="mock" />
  </div>
</template>
<script>
import Common from '../../../../utils/Common.js'
import Mocker from './Mocker.js'
import MockerSetting from './MockerSetting.vue'
import ResponseManualEditor from '../../response/manual/Editor.vue'
import ResponseMatchRuleEditor from '../../response/match/Editor.vue'
import ResponseSnippetEditor from '../../response/snippet/Editor.vue'
import StatusEditor from '../../status/Editor.vue'
export default {
    components : {
        'status-editor' : StatusEditor,
        'mocker-setting' : MockerSetting,
        'response-snippet-editor' : ResponseSnippetEditor,
        'response-match-rule-editor' : ResponseMatchRuleEditor,
        'response-manual-editor' : ResponseManualEditor,
    },
    props : {
        value : {type:Object},
    },
    data () {
        return {
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
            /**
             * instance of mock service
             * @property {Mocker}
             */
            mocker : null,
        };
    },
    created() {
        this.mock = this.value;
    },
    methods : {
        /**
         * enable mocker setting
         * @public
         */
        setting() {
            this.$refs.setting.open();
        },

        /**
         * start mocker
         */
        async start() {
            this.mocker = new Mocker(this.mock);
            await this.mocker.start();
        },

        /**
         * stop mocker
         */
        async stop() {
            await this.mocker.stop();
        },

        /**
         * get mocker instance
         * @returns {Mocker}
         */
        getMocker() {
            return this.mocker;
        },

        /**
         * @returns {String}
         */
        dataEntryHexContentFormat( entry ) {
            return Common.convertBufferToHexString(entry.data);
        },

        /**
         * event handler on manual send button clicked.
         * @param {Object} content
         */
        async actionContentSend( content ) {
            await this.mocker.send(content);
            this.$forceUpdate();
            
            let listContainer = this.$refs.dataEntryList;
            this.$nextTick(() => listContainer.scrollTop = listContainer.scrollHeight);
        },

        /**
         * event handler on manual editor options changed.
         */
        async actionEditorOptionChange() {
            await this.mock.save();
        },
    },
}
</script>
<style scoped>
.data-entry-send .content {background: #f6f6f6;padding: 3px;border: solid 1px #eaeaea;color: #9f9f9f;user-select: text;}
.data-entry-receive .content {background: #f2fbff;padding: 3px;border: solid 1px #d5effc;color: #9f9f9f;user-select: text;}




.block-separator {text-align: center;
    position: absolute;
    width: 100%;
    cursor: ns-resize;
    top: -10px;
    height: 10px;}
.block-separator:hover {    background: #d6d6d6;
    border-radius: 5px;}
</style>
<style>
.mock-mocker-serialport-response-tab .ant-tabs-content {
    flex-grow: 1;
    height: 0;}
</style>