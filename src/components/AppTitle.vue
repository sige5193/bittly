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

        <!-- Configurable Menus -->
        <a-dropdown v-for="(menuEntry, menuKey) in menus" :key="menuKey" class="mr-2" :trigger="['click']">
          <span class="app-dropdown-menu-title">{{menuEntry.title}}</span>
          <a-menu slot="overlay" @click="actionConfigurableMenuItemClick">
            <a-menu-item v-for="(menuEntryItem,menuEntryItemIndex) in menuEntry.items" 
              :key="menuEntryItem.key"
              :data-menu-key="menuKey"
              :data-item-index="menuEntryItemIndex"
            >{{menuEntryItem.title}}</a-menu-item>
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
            /**
             * @property {Object<String:Object>}
             */
            menus : {},
        };
    },
    created() {
        this.menuInit();
        this.$eventBus.$emit('app-title-init', this);
    },
    methods : {
        /**
         * init menus
         * @private
         */
        menuInit() {
            this.menuAdd('tools', this.$t('app.menu.tool.label'));
            this.menuItemPush('tools', {
                key:'ToolSerialportServer',
                title:this.$t('app.menu.tool.serialportServer'),
                action:()=>this.newWindow('/tool-serialport-server.html')
            });
            this.menuItemPush('tools', {
                key:'ToolTcpServer',
                title:this.$t('app.menu.tool.tcpServer'),
                action:()=>this.newWindow('/tool-tcp-server.html')
            });
            this.menuItemPush('tools', {
                key:'ToolUdpServer',
                title:this.$t('app.menu.tool.udpServer'),
                action:()=>this.newWindow('/tool-udp-server.html')
            });
            this.menuItemPush('tools', {
                key:'ToolWsServer',
                title:this.$t('app.menu.tool.wsServer'),
                action:()=>this.newWindow('/tool-ws-server.html')
            });
            this.menuItemPush('tools', {
                key:'ToolTerminal',
                title:this.$t('app.menu.tool.terminal'),
                action:()=>this.newWindow('/tool-terminal.html')
            });
            this.menuItemPush('tools', {
                key:'ToolCalculator',
                title:this.$t('app.menu.tool.calculator'),
                action:()=>this.newWindow('/tool-calculator.html')
            });
        },

        /**
         * add menu
         * @public
         * @param {String} key
         * @param {String} title
         */
        menuAdd(key, title) {
            this.menus[key] = {};
            this.menus[key].title = title;
            this.menus[key].items = [];
        },

        /**
         * add menu item
         * @public
         * @param {String} menuKey
         * @param {Object} item
         */
        menuItemPush(menuKey, item) {
            this.menus[menuKey].items.push(item);
        },

        /**
         * open new window by given link
         * @parma {String} link
         */
        newWindow( link ) {
            window.ipcRenderer.send("window-open", {uri:link});
        },

        /**
         * event handler on configurable menu item clicked
         * @parma {Event} event
         */
        actionConfigurableMenuItemClick( event ) {
            let eventData = event.domEvent.target.dataset;
            let item = this.menus[eventData.menuKey].items[eventData.itemIndex];
            item.action();
        },

        /**
         * event handler on menu item clicked
         */
        actionMenuItemClick( event ) {
            let eventData = event.domEvent.target.dataset;
            if ( 'new-window' === eventData.act ) {
                this.newWindow(eventData.path);
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