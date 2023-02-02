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
      <a-button type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
    </template>
  </a-modal>
</template>
<script>
import MockerSettingBase from '../MockerSettingBase.js'
export default {
    name : 'MockMockerUdpSetting',
    mixins : [MockerSettingBase],
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
        }
    }
}
</script>