<template>
  <a-modal v-if="enable" v-model="enable"
    :closable="false"
    :keyboard="false"
    :maskClosable="false" 
    :title="$t('mock.mockers.websocket.settingTitle')"
  >
    <a-form :label-col="{span:5}" :wrapper-col="{span:17}">
      <a-form-item :label="$t('mock.name')">
        <a-input v-model="mock.name" />
      </a-form-item>
       
      <!-- protocol -->
      <a-form-item :label="$t('mock.mockers.websocket.protocol')">
        <a-select v-model="mock.options.protocol" @change="forceUpdate">
          <a-select-option value="ws">ws</a-select-option>
          <a-select-option value="wss">wss</a-select-option>
        </a-select>
      </a-form-item>
      
      <!-- host -->
      <a-form-item :label="$t('mock.mockers.websocket.host')">
        <a-input v-model="mock.options.host" @input="forceUpdate"/>
      </a-form-item>

      <!-- port -->
      <a-form-item :label="$t('mock.mockers.websocket.port')">
        <a-input v-model="mock.options.port" @input="forceUpdate"/>
      </a-form-item>

      <!-- path -->
      <a-form-item :label="$t('mock.mockers.websocket.path')">
        <a-input v-model="mock.options.path" @input="forceUpdate"/>
      </a-form-item>

      <!-- data format -->
      <a-form-item :label="$t('mock.mockers.websocket.encoding')">
        <a-radio-group v-model="mock.options.encoding" button-style="solid" @change="forceUpdate">
          <a-radio-button value="text">TEXT</a-radio-button>
          <a-radio-button value="hex">HEX</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <template v-if="'wss' === mock.options.protocol">
        <!-- pem key -->
        <a-form-item :label="$t('mock.mockers.websocket.keyContent')">
          <a-textarea 
            v-model="mock.options.sslKey" 
            placeholder="-----BEGIN RSA PRIVATE KEY-----" 
            :rows="3"
            @input="forceUpdate"
          />
        </a-form-item>
        <!-- cert content -->
        <a-form-item :label="$t('mock.mockers.websocket.certContent')">
          <a-textarea 
            v-model="mock.options.sslCert" 
            placeholder="-----BEGIN CERTIFICATE-----" 
            :rows="3"
            @input="forceUpdate"
          />
        </a-form-item>
      </template>
    </a-form>

    <template slot="footer">
      <a-row>
        <a-col :span="12" class="text-left">
          <a-button v-if="'wss' === mock.options.protocol" 
            :loading="isGeneratingCert"
            @click="actionGenerateCert"
          >{{$t('mock.mockers.websocket.certGenerate')}}</a-button>
          <a-button v-if="'wss' === mock.options.protocol" 
            :loading="isGeneratingCerFile"
            @click="actionCertExportToCerFile"
          >{{$t('mock.mockers.websocket.certExportCerFile')}}</a-button>
        </a-col>
        <a-col :span="12" class="text-right">
          <a-button type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script>
import MyString from '../../../../utils/datatype/MyString.js';
import MockerSettingBase from '../MockerSettingBase.js'
export default {
    name : 'MockMockerUdpSetting',
    mixins : [MockerSettingBase],
    data() {
        return {
            /**
             * indicate whether cert files is generating
             * @property {Boolean}
             */
            isGeneratingCert : false,
            /**
             * indicate whether exporting cer file.
             * @property {Boolean}
             */
            isGeneratingCerFile : false,
        };
    },
    methods : {
        /**
         * init mock options
         * @param {Object} options 
         */
        initOptions( options ) {
            options.protocol = 'ws';
            options.host = '127.0.0.1';
            options.port = '8899';
            options.path = '';
            options.encoding = 'text';
        },

        /**
         * generate summary by options
         * @param {Object} options 
         * @returns 
         */
        generateSummary( options ) {
            return `${options.protocol}://${options.host}:${options.port}/${options.path}`;
        },
        
        /**
         * generate cert 
         */
        actionGenerateCert() {
            let $this = this;
            $this.isGeneratingCert = true;
            
            let csrOptions = {};
            csrOptions.commonName = $this.mock.options.host
            csrOptions.organization = 'Bittly';
            window.pem.createCSR(csrOptions, (csrErr, csrData) => {
                if (null !== csrErr) {
                     $this.$message.error($this.$t('mock.mockers.websocket.certGenerateFailed',[csrErr.message]));
                    return ;
                }

                let certOptions = {};
                certOptions.days = 365;
                certOptions.selfSigned = true;
                certOptions.csr = csrData.csr
                certOptions.config = csrData.config
                certOptions.clientKey = csrData.clientKey
                window.pem.createCertificate(certOptions, function(err, keys) {
                    $this.isGeneratingCert = false;
                    if (err) {
                        $this.$message.error($this.$t('mock.mockers.websocket.certGenerateFailed',[err.message]));
                        return ;
                    }

                    $this.mock.options.sslKey = keys.serviceKey;
                    $this.mock.options.sslCert = keys.certificate;
                    $this.$forceUpdate();
                });
            })
        },

        /**
         * export cert to cert.cer
         */
        actionCertExportToCerFile() {
            let cerFilePath = window.remote.dialog.showSaveDialogSync({defaultPath:'cert.cer'});
            if ( undefined === cerFilePath ) {
                return ;
            }

            let $this = this;
            this.isGeneratingCerFile = true;
            let pemFilePath = window.path.join(window.os.tmpdir(), MyString.uuidV4());
            window.fs.writeFileSync(pemFilePath, this.mock.options.sslCert);
            window.pem.convert.PEM2DER(pemFilePath, cerFilePath, (err,result) => {
                $this.isGeneratingCerFile = false;
                if ( null !== err ) {
                    $this.$message.error($this.$t('mock.mockers.websocket.certExportCerFileFailed',[err.message]));
                    return ;
                }

                $this.$message.success($this.$t('mock.mockers.websocket.certExportCerFileSuccess'));
                window.remote.shell.showItemInFolder(cerFilePath);
            });
        },
    }
}
</script>