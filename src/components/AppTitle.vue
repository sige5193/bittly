<template>
  <a-row class="text-white app-title">
    <a-col :span="8">
      <div class="app-title-content">
        <img src="../assets/icon-512x512.png" class="app-logo" />

        <!-- File -->
        <a-dropdown class="mr-2 ml-2" :trigger="['click']">
          <span class="app-dropdown-menu-title" ref="dmenuTriggerFile">{{$t('app.menu.file.label')}}</span>
          <a-menu ref="menuFile" slot="overlay" @click="actionMenuItemClick">
            <a-menu-item key="FileSetting">{{$t('app.menu.setting')}}</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="FileToggleAlwaysOnTop">
              <span v-if="!alwaysOnTopEnable">{{$t('app.menu.file.alwaysOnTopEnable')}}</span>
              <span v-else>{{$t('app.menu.file.alwaysOnTopDisable')}}</span>
            </a-menu-item>
            <a-menu-item key="FileOpenDevTools">{{$t('app.menu.file.opendevtool')}}</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="FileExit">{{$t('app.menu.file.exit')}}</a-menu-item>
          </a-menu>
        </a-dropdown>

        <!-- Project -->
        <project-menu></project-menu>

        <!-- Environment -->
        <env-menu></env-menu>

        <!-- Tool -->
        <a-dropdown class="mr-2" :trigger="['click']">
          <span class="app-dropdown-menu-title" ref="dmenuTriggerTool">{{$t('app.menu.tool.label')}}</span>
          <a-menu ref="menuTool" slot="overlay" @click="actionMenuItemClick">
            <a-menu-item key="ToolSerialportServer" data-act="new-window" data-path="/tool-serialport-server.html">{{$t('app.menu.tool.serialportServer')}}</a-menu-item>
            <a-menu-item key="ToolTcpServer" data-act="new-window" data-path="/tool-tcp-server.html">{{$t('app.menu.tool.tcpServer')}}</a-menu-item>
            <a-menu-item key="ToolUdpServer" data-act="new-window" data-path="/tool-udp-server.html">{{$t('app.menu.tool.udpServer')}}</a-menu-item>
            <a-menu-item key="ToolWsServer" data-act="new-window" data-path="/tool-ws-server.html">{{$t('app.menu.tool.wsServer')}}</a-menu-item>
            <a-menu-item key="ToolTerminal" data-act="new-window" data-path="/tool-terminal.html">{{$t('app.menu.tool.terminal')}}</a-menu-item>
            <a-menu-item key="ToolCalculator" data-act="new-window" data-path="/tool-calculator.html">{{$t('app.menu.tool.calculator')}}</a-menu-item>
          </a-menu>
        </a-dropdown>

        <!-- Help -->
        <a-dropdown class="mr-2" :trigger="['click']">
          <span class="app-dropdown-menu-title" ref="dmenuTriggerHelp">{{$t('app.menu.help.label')}}</span>
          <a-menu ref="menuHelp" slot="overlay" @click="actionMenuItemClick">
            <a-menu-item key="HelpGetStart">{{$t('app.menu.help.getStart')}}</a-menu-item>
            <a-menu-item key="HelpFeedback">{{$t('app.menu.help.feedback')}}</a-menu-item>
            <a-menu-item key="HelpUpdate">{{$t('app.menu.help.update')}}</a-menu-item>
            <a-menu-item key="HelpAbout">{{$t('app.menu.help.about')}}</a-menu-item>
          </a-menu>
        </a-dropdown>

        <app-about ref="appAbout" />
        <app-setting ref="appSetting" />
      </div>
    </a-col>

    <!-- App name -->
    <a-col :span="8" class="text-center">
      <div class="app-name">Bittly {{appVersion}}</div>
    </a-col>

    <!-- other actions -->
    <a-col :span="8" class="text-right">
      <div class="app-title-content">
        <user-login></user-login>
        <div class="btn-win-act" ref="btnWinMinSize" @click="actionWinMinSize"><a-icon type="minus-circle" /></div>
        <div class="btn-win-act" ref="btnWinMaxSize" @click="actionWinMaxSize"><a-icon type="plus-circle" /></div>
        <div class="btn-win-act close" ref="btnWinClose" @click="actionWinClose"><a-icon type="close-circle" /></div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import PackageInfo from '../../package.json'
import AppUserLogin from './AppUserLogin.vue'
import ProjectSwitch from '../modules/project/DropdownProjectSwitch.vue'
import DropdownEnvSwitch from '../modules/environment/DropdownEnvSwitch.vue'
import AppSetting from './AppSetting.vue'
import AppAbout from './AppAbout.vue'
export default {
    name : 'AppMenu',
    components : {
        'app-about' : AppAbout,
        'app-setting' : AppSetting,
        'project-menu' : ProjectSwitch,
        'env-menu' : DropdownEnvSwitch,
        'user-login' : AppUserLogin,
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            alwaysOnTopEnable : false,
            /**
             * @property {String}
             */
            appVersion : PackageInfo.version,
        };
    },
    methods : {
        /**
         * event handler on menu item clicked
         */
        actionMenuItemClick( event ) {
            let eventData = event.domEvent.target.dataset;
            if ( 'new-window' === eventData.act ) {
                window.ipcRenderer.send("window-open", {uri:eventData.path});
            } else {
                let handler = `handle${event.key}`;
                this[handler]();
            }
        },
        
        /**
         * File > Setting
         */
        handleFileSetting() {
            this.$refs.appSetting.show();
        },

        /**
         * File > ToggleAlwaysOnTop
         */
        handleFileToggleAlwaysOnTop() {
            this.alwaysOnTopEnable = !this.alwaysOnTopEnable;
            window.remote.getCurrentWindow().setAlwaysOnTop(this.alwaysOnTopEnable);
        },

        /**
         * File > Open dev tools
         */
        handleFileOpenDevTools() {
            window.remote.getCurrentWebContents().openDevTools();
        },

        /**
         * File > Exit
         */
        handleFileExit() {
            window.close();
        },
        
        /**
         * Help > Get Start
         */
        handleHelpGetStart() {
            window.shell.openExternal('https://bittly.sigechen.com/manual?src=bittly');
        },

        /**
         * Help > Feedback
         */
        handleHelpFeedback() {
            this.$eventBus.$emit('menu-help-feedback-clicked');
        },

        /**
         * Help > Update
         */
        handleHelpUpdate() {
            this.$eventBus.$emit('menu-help-update-clicked');
        },

        /**
         * Help > About
         */
        handleHelpAbout() {
            this.$refs.appAbout.show();
        },

        /**
         * Minimize current window
         */
        actionWinMinSize() {
            window.remote.getCurrentWindow().minimize();
        },

        /**
         * Maximize currrent window
         */
        actionWinMaxSize() {
            let win = window.remote.getCurrentWindow();
            if ( win.isMaximized() ) {
                win.restore();
            } else {
                win.maximize();
            }
        },

        /**
         * Close current window
         */
        actionWinClose(){
            this.$confirm({
                title: this.$t('app.quitConfirm'),
                okText: this.$t('button.ok'),
                okType: 'danger',
                cancelText: this.$t('button.cancel'),
                onOk() {
                    window.close();
                },
            });
        }
    },
}
</script>
<style>
.app-dropdown-menu-title {display: inline-block;height: 32px;font-size: 0.9em !important;}
</style>
<style scoped>
.app-title {-webkit-app-region: drag;background: rgb(66 66 66);line-height:32px;}
.app-title-content {-webkit-app-region: no-drag;display: inline-block;}
.app-logo {width:20px;height: 20px;margin-left: 5px;}
.app-name {padding: 0 5px;font-weight: 800;display: inline-block;}
.btn-win-act {display: inline-block;padding: 0 10px;}
.btn-win-act:hover {background: #000;}
.btn-win-act.close:hover {background: red;}
</style>