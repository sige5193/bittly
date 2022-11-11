<!--
 - the dialog of about information to show info about this app.
-->
<template>
  <a-modal v-model="enabled" :title="$t('app.about')" :footer="null">
    <p class="text-center">
      <img style="width:100px;height:100px;" src="../assets/icon.png">
    </p>
    <p class="text-center"><strong>Bittly</strong> {{packInfo.version}}</p>
    <p class="text-center">Electron : {{electronVersion}}</p>
    <p class="text-center">Chrome : {{chromeVersion}}</p>
    <p class="text-center">Node.js : {{nodeVersion}}</p>
    <p class="text-center">V8 : {{v8Version}}</p>
    <p class="text-center">OS : {{osInfo}}</p>
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
             * @property {String|null}
             */
            electronVersion : null,
            /**
             * @property {String|null}
             */
            chromeVersion : null,
            /**
             * @property {String|null}
             */
            nodeVersion : null,
            /**
             * @property {String|null}
             */
            v8Version : null,
            /**
             * @property {String|null}
             */
            osInfo : null,
        };
    },
    methods : {
        /**
         * display about dialog
         */
        show() {
            this.osInfo = [];
            this.osInfo.push(window.os.type());
            this.osInfo.push(window.os.arch());
            this.osInfo.push(window.os.version());
            this.osInfo = this.osInfo.join(' ');

            this.v8Version = window.remote.process.versions.v8;
            this.nodeVersion = window.remote.process.versions.node;
            this.chromeVersion = window.remote.process.versions.chrome;
            this.electronVersion = window.remote.process.versions.electron;
            this.enabled = true;
        }
    }
}
</script>