<template>
  <div class="h-100 d-flex flex-dir-column">
    <app-tool-menu :tname="$t('app.toolTerminal.windowTitle')"/>

    <template v-if="hasInited">
      <div ref="targetbar" class="p-2 bg-light">
        <a-row>
          <a-col :span="3" class="pr-1">
            <a-select 
              ref="selectTargetType" 
              class="w-100" 
              v-model="target.type" 
              @change="actionTargetTypeChange"
            >
              <a-select-option v-for="(targetEditor, tindex) in targetEditors" 
                :key="tindex" 
                :value="tindex"
              > {{targetEditor.name}} </a-select-option>
            </a-select>
          </a-col>

          <a-col :span="19" class="pr-1">
            <component 
              :is="`target-${target.type}`"
              v-model="target"
            ></component>
          </a-col>
          <a-col :span="2" class="text-right">
            <a-button v-if="connection == null" 
              ref="btnConnect" 
              type="primary" 
              @click="actionConnect"
            > <a-icon type="play-circle" /> </a-button>
            <a-button 
              v-else 
              ref="btnDisconnect" 
              type="danger" 
              @click="actionDisconnect"
            > <a-icon type="poweroff" /> </a-button>
          </a-col>
        </a-row>
      </div>

      <div>
        <a-empty v-if="null == connection" :description="false" class="pt-5" />
        <div v-else ref="terminalWrapper" id="terminal" class="w-100"></div>
      </div>
    </template>
  </div>
</template>
<script>
import ToolMixin from '../utils/ToolMixin.js'
import AppToolMenu from '../utils/AppToolMenu.vue'
import AppHelper from '../../utils/AppHelper.js'
import { Terminal } from 'xterm'
import { FitAddon } from "xterm-addon-fit";
import CommunicatorFactory from '../../modules/directive/communicators/CommunicatorFactory.js'
import TargetEditorRegistryMixin from '../../modules/directive/communicators/TargetEditorRegistryMixin.js';
require('xterm/css/xterm.css');
require('../../utils/Common.css');
export default {
    name : 'ToolTerminal',
    mixins : [TargetEditorRegistryMixin,ToolMixin],
    components : {
        'app-tool-menu' : AppToolMenu,
    },
    data() {
        return {
            hasInited : false,
            target : null,
            connection : null,
            terminal : null,
            terminalFitAddon : null,
        };
    },
    mounted () {
        this.init();
    },
    destroyed() {
        this.actionDisconnect();
    },
    methods : {
        /**
         * 初始化
         */
        async init() {
            this.hasInited = false;
            this.$i18n.locale = await AppHelper.langCodeGet();

            document.title = this.$t('app.toolTerminal.windowTitle');

            this.target = {};
            this.target.type = 'SerialPort';
            
            let $this = this;
            window.onresize = function() {
                $this.actionWindowResize();
            };
            this.hasInited = true;
        },
        
        /**
         * 窗口尺寸变更
         */
        actionWindowResize() {
            if ( null == this.terminalFitAddon ) {
                return ;
            }
            
            let tarHeight = this.$refs.targetbar.getBoundingClientRect().height.toFixed(2);
            let docHeight = document.documentElement.clientHeight;
            this.$refs.terminalWrapper.style.height = `${docHeight - tarHeight}px`;
            this.terminalFitAddon.fit();
        },

        /**
         * 通讯目标变更
         */
        actionTargetTypeChange() {
            this.$forceUpdate();
        },
        
        /**
         * 打开连接
         */
        async actionConnect () {
            let $this = this;
            try {
                this.connection = await CommunicatorFactory.getCommunicator(this.target);
                await this.connection.open();
            } catch ( e ) {
                this.connection = null;
                this.$message.error(e.toString());
                return;
            }
            
            if ( !this.connection.getIsOpen() ) {
                this.$message.error(this.$t('app.toolTerminal.connectionOpenFailed'));
                return;
            }

            this.terminal = new Terminal({
                cursorBlink: true,
                cursorStyle: "underline",
                scrollback: 100,
            });
            const fitAddon = new FitAddon();
            this.terminal.loadAddon(fitAddon);
            this.terminalFitAddon = fitAddon;
            
            this.terminal.open(document.getElementById('terminal'));
            fitAddon.fit();
            this.terminal.onData(data =>  {
                $this.connection.write(data);
            });
            this.connection.onData((data) => {
                $this.terminal.write(data.toString());
            });

            this.$nextTick(function() {
                $this.terminal.focus();
                $this.actionWindowResize();
            });
        },

        /**
         * 断开连接
         */
        async actionDisconnect() {
            if ( null == this.connection ) {
                return;
            }
            this.terminal.dispose();
            this.terminal = null;
            this.terminalFitAddon = null;

            await this.connection.close();
            this.connection = null;
        }
    },
}
</script>