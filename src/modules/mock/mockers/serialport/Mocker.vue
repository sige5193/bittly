<template>
  <div class="d-flex flex-dir-column h-100">
    <a-row class="border-bottom p-1">
        <a-col :span="12">
         <a-radio-group button-style="solid" size="small" class="mr-1" v-model="viewerMode">
          <a-radio-button value="hex">HEX</a-radio-button>
          <a-radio-button value="text">TEXT</a-radio-button>
        </a-radio-group>



          <a-switch checked-children="合并数据" un-checked-children="合并数据" default-checked style="vertical-align: baseline;"/>
        </a-col>
        <a-col :span="12" class="text-right">
          <a-input addon-before="接收" value="1.23M" size="small" style="width:120px;" class="mr-1" disabled />
          <a-input addon-before="发送" value="1.23K" size="small" style="width:120px;" class="mr-1" disabled />
          <a-button size="small" class="mr-1">导出</a-button>
        </a-col>
      </a-row>
    
    <!-- data entries -->
    <data-entry-list-viewer ref="dataEntryListViewer" 
      :mode="viewerMode"
      :entries="null !== mocker ? mocker.dataEntries : []"
    />
    
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
        <a-tab-pane key="status" :tab="$t('mock.status.title')">
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
import DataEntryListViewer from '../../data-entry/ListViewer.vue'
import Common from '../../../../utils/Common.js'
import Mocker from './Mocker.js'
import MockerSetting from './MockerSetting.vue'
import ResponseManualEditor from '../../response/manual/Editor.vue'
import ResponseMatchRuleEditor from '../../response/match/Editor.vue'
import ResponseSnippetEditor from '../../response/snippet/Editor.vue'
import StatusEditor from '../../status/Editor.vue'
export default {
    components : {
        'data-entry-list-viewer' : DataEntryListViewer,
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
            /**
             * name of viewer mode
             * @property {String}
             */
            viewerMode : 'hex',
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
         * event handler on manual send button clicked.
         * @param {Object} content
         */
        async actionContentSend( content ) {
            await this.mocker.send(content);
            this.$forceUpdate();
            this.$refs.dataEntryListViewer.scrollToBottom();
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
.mock-mocker-serialport-response-tab .ant-tabs-content {flex-grow: 1;height: 0;}
</style>