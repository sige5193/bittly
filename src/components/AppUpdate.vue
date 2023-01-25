<template>
  <div class="d-inline-block pr-1" v-if="null != release">
    <div @click="modalEnable = true" class="app-update-btn">
      <a-icon type="compass" class="mr-1" spin/>
      <span class="text-small">{{$t('app.update.newpackAvailable')}}</span>
    </div>
    
    <!-- release info modal-->
    <a-modal v-if="modalEnable" 
      :visible="modalEnable" 
      :title="`${$t('app.update.title')} v${release.version}`" 
      :bodyStyle="{padding:0}"
      @cancel="modalEnable=false"
    >
      <div v-if="null != download" class="progress-container">
        <div class="progress-bar" :style="{width:`${download.percent}%`}"></div>
      </div>
      <div class="release-note p-3" v-html="release.note"></div>
      <div class="p-2">
        {{$t('app.update.publishTime')}} : {{release.created_at}}
      </div>
      <template slot="footer">
        <a-button ref="btnIgnore" @click="actionIgnore" :disabled="isUpdating">{{$t('app.update.btnIgnoreThisUpdate')}}</a-button>
        <a-button ref="btnUpdate" @click="actionUpdate" type="primary" :loading="isUpdating">{{$t('app.update.btnUpdate')}}</a-button>
      </template>
    </a-modal>
    
  </div>
</template>
<script>
import MyString from '../utils/datatype/MyString.js'
import packageJson from '../../package.json';
import MdbRuntimeVariable from '../models/MdbRuntimeVariable';
export default {
    name : 'AppUpdate',
    data() {
        return {
            release : null,
            modalEnable : false,
            download : null,
            isUpdating : false,
            checkVersion : null,
        };
    },
    mounted() {
        this.init();
        this.start();
    },
    methods : {
        /**
         * init 
         */
        init() {
            this.$env.on('ipcRenderer','app-update-checking', () => this.handleCheckingForUpdate() );
            this.$env.on('ipcRenderer','app-update-not-available', () => this.handleUpdateNotAvailable() );
            this.$env.on('ipcRenderer','app-update-available', ( event, info ) => this.handleUpdateAvailable(info));
            this.$env.on('ipcRenderer','app-update-error', ( event, error ) => this.handleError(error));
            this.$env.on('ipcRenderer','app-update-download-progress', ( event, progress) => this.handleDownloadProgress(progress));
            this.$env.on('ipcRenderer','app-update-downloaded', () => this.handleUpdateDownloaded() );
            this.$eventBus.$on('menu-help-update-clicked', () => this.manualUpdateCheck() );
        },

        /**
         * check update manually
         */
        async manualUpdateCheck() {
            if ( 'electron' != this.$env.name ) {
                return this.$env.errorActionNotSupported();
            }

            this.$message.loading(this.$t('app.update.checkingForUpdate'), 0);
            await this.start();
            this.$message.destroy();
            if ( null === this.release ) {
                this.$message.success(this.$t('app.update.noUpdateAvailable'));
            } else {
                this.modalEnable = true;
            }
        },

        /**
         * start update checking
         */
        async start() {
            if ( 'electron' != this.$env.name ) {
                return ;
            }

            this.release = null;
            let clientId = await MdbRuntimeVariable.getVarValue('app_client_id','');
            if ( '' == clientId ) {
                clientId = MyString.uuidV4();
                await MdbRuntimeVariable.setVarValue('app_client_id', clientId);
            }
            
            this.checkVersion = await MdbRuntimeVariable.getVarValue('update_check_version', '');
            if ( '' == this.checkVersion ) {
                this.checkVersion = packageJson.version;
            }
            
            if ( 0 < this.versionCompare(packageJson.version, this.checkVersion) ) {
                this.checkVersion = packageJson.version;
            }

            let os = window.os;
            this.$log('platform = {0}; arch = {1}; cur version = {2}',os.platform(), os.arch(), this.checkVersion);
            let updataCheck = await this.$bittly.systemUpdateCheck(this.checkVersion, clientId);
            this.$log('update info : ' + JSON.stringify(updataCheck));
            if ( !updataCheck.success ) {
                return ;
            }
            this.release = updataCheck.data;
        },
        
        /**
         * compare version number, and returns verA - verB
         * @param {String} verA
         * @param {String} verB
         * @returns {Number}
         */
        versionCompare( verA, verB ) {
            verA = verA.split('.');
            verB = verB.split('.');
            for ( let i=0; i<verA.length; i++ ) {
                if ( verA[i] == verB[i] ) {
                    continue;
                }
                return verA[i]*1 - verB[i]*1;
            }
            return 0;
        },

        /**
         * exit app and update
         */
        actionUpdate() {
            this.isUpdating = true;
            window.ipcRenderer.send("app-update-check");
        },

        /**
         * ignore this release version
         */
        async actionIgnore () {
            this.modalEnable = false;
            await MdbRuntimeVariable.setVarValue('update_check_version', this.release.version);
            this.release = null;
        },

        /**
         * status : downloading
         */
        handleDownloadProgress ( progress ) {
            this.$appLog('[app-update] downloading', progress);
            this.download = progress;
            this.$forceUpdate();
        },

        /**
         * status : update downloaded
         */
        handleUpdateDownloaded( ) {
            this.$appLog('[app-update] downloaded');
            window.ipcRenderer.send("app-update-quit-and-install");
        },

        /**
         * status : error
         */
        handleError (error) {
            this.$appLog('[app-update] error', error);
            this.$message.error(error.message);
            this.isUpdating = false;
        },

        /**
         * status : checking if update available
         */
        handleCheckingForUpdate() {
            this.$appLog('[app-update] checking');
        },

        /**
         * status : update available
         */
        handleUpdateAvailable( info ) {
            this.$appLog('[app-update] available', info);
        },

        /**
         * status : no update available
         */
        handleUpdateNotAvailable() {
            this.$appLog('[app-update] not available');
            this.$message.error(this.$t('app.update.error'));
            this.isUpdating = false;
        },
    },
}
</script>
<style scoped>
.progress-container {width: 100%;height: 2px;background: #d9d9d9;}
.progress-bar {background: #1890ff;height: 2px;}
.release-note {white-space: break-spaces;max-height: 200px;overflow-y: auto;}
.btn-update {padding: 0px 5px;height: 16px;font-size: 14px;line-height: 14px;}
</style>