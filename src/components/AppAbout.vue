<!--
 - the dialog of about information to show info about this app.
-->
<template>
  <a-modal v-model="enabled" :title="$t('app.about')" :footer="null">
    <p class="text-center">
      <img style="width:100px;height:100px;" src="../assets/icon.png">
    </p>
    <p class="text-center"><strong>Bittly</strong> {{packInfo.version}}</p>
    <template v-if="null !== electronInfo">
      <p class="text-center">Electron : {{electronInfo.electronVersion}}</p>
      <p class="text-center">Chrome : {{electronInfo.chromeVersion}}</p>
      <p class="text-center">Node.js : {{electronInfo.nodeVersion}}</p>
      <p class="text-center">V8 : {{electronInfo.v8Version}}</p>
      <p class="text-center">OS : {{electronInfo.osInfo}}</p>
    </template>
  </a-modal>
</template>
<script>
import packageInfo from '../../package.json'
export default {
    data() {
        return {
            /**
             * @property {Boolean}
             */
            enabled : false,
            /**
             * content of package.json
             * @property {Object}
             */
            packInfo : packageInfo,
            /**
             * @property {Object|null}
             */
            electronInfo : null,
        };
    },
    methods : {
        /**
         * display about dialog
         */
        show() {
            this.setupElectronInfo();
            this.enabled = true;
        },

        /**
         * setup electron info
         */
        setupElectronInfo() {
            this.electronInfo = null;
            if ( 'electron' != this.$env.name ) {
                return ;
            }

            this.electronInfo = {};
            this.electronInfo.osInfo = [];
            this.electronInfo.osInfo.push(window.os.type());
            this.electronInfo.osInfo.push(window.os.arch());
            this.electronInfo.osInfo.push(window.os.version());
            this.electronInfo.osInfo = this.electronInfo.osInfo.join(' ');

            this.electronInfo.v8Version = window.remote.process.versions.v8;
            this.electronInfo.nodeVersion = window.remote.process.versions.node;
            this.electronInfo.chromeVersion = window.remote.process.versions.chrome;
            this.electronInfo.electronVersion = window.remote.process.versions.electron;
        }
    }
}
</script>