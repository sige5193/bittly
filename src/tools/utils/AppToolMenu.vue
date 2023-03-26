<template>
  <a-row class="app-title text-white">
    <!-- Menus -->
    <a-col :span="8">
      <div class="app-title-content">
        <img src="../../assets/icon-512x512.png" class="app-logo" />

        <a-dropdown class="mr-2 ml-2" :trigger="['click']">
          <span class="app-dropdown-menu-title">{{$t('app.menu.file.label')}}</span>
          <a-menu slot="overlay" @click="actionMenuItemClick">
            <a-menu-item key="FileToggleAlwaysOnTop">
              <span v-if="!alwaysOnTopEnable">{{$t('app.menu.file.alwaysOnTopEnable')}}</span>
              <span v-else>{{$t('app.menu.file.alwaysOnTopDisable')}}</span>
            </a-menu-item>
            <a-menu-item key="FileOpenDevTools">{{$t('app.menu.file.opendevtool')}}</a-menu-item>
            <a-menu-divider />
            <a-menu-item key="FileExit">{{$t('app.menu.file.exit')}}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </a-col>
    
    <!-- App name -->
    <a-col :span="8" class="text-center">
      <div class="app-name">{{appName}} {{appVersion}} - {{tname}}</div>
    </a-col>

    <!-- other actions -->
    <a-col :span="8" class="text-right">
      <div class="app-title-content">
        <div class="btn-win-act" @click="actionWinMinSize"><a-icon type="minus-circle" /></div>
        <div class="btn-win-act" @click="actionWinMaxSize"><a-icon type="plus-circle" /></div>
        <div class="btn-win-act close" @click="actionWinClose"><a-icon type="close-circle" /></div>
      </div>
    </a-col>
  </a-row>
</template>
<script>
import PackageInfo from '../../../package.json'
export default {
    name : 'AppToolMenu',
    props : {
        tname : {type:String}
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
            appName : PackageInfo.name,
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
            let handler = `handle${event.key}`;
            this[handler]();
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
<style scoped>
.app-title {-webkit-app-region: drag;background: rgb(66 66 66);line-height:32px;}
.app-title-content {-webkit-app-region: no-drag;display: inline-block;}
.app-dropdown-menu-title {display: inline-block;height: 32px;font-size: 0.9em !important;}
.app-logo {width:20px;height: 20px;margin-left: 5px;}
.app-name {padding: 0 5px;font-weight: 800;display: inline-block;}
.btn-win-act {display: inline-block;padding: 0 10px;}
.btn-win-act:hover {background: #000;}
.btn-win-act.close:hover {background: red;}
</style>