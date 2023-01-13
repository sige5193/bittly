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
        <a-select v-model="mock.options.protocol">
          <a-select-option value="ws">ws</a-select-option>
          <a-select-option value="wss">wss</a-select-option>
        </a-select>
      </a-form-item>
      
      <!-- host -->
      <a-form-item :label="$t('mock.mockers.websocket.host')">
        <a-input v-model="mock.options.host"/>
      </a-form-item>

      <!-- port -->
      <a-form-item :label="$t('mock.mockers.websocket.port')">
        <a-input v-model="mock.options.port"/>
      </a-form-item>

      <!-- path -->
      <a-form-item :label="$t('mock.mockers.websocket.path')">
        <a-input v-model="mock.options.path"/>
      </a-form-item>

      <template v-if="'wss' === mock.options.protocol">
        <!-- pem key -->
        <a-form-item :label="$t('mock.mockers.websocket.keyContent')">
          <a-textarea 
            v-model="mock.options.sslKey" 
            placeholder="-----BEGIN RSA PRIVATE KEY-----" 
            :rows="3"
          />
        </a-form-item>
        <!-- cert content -->
        <a-form-item :label="$t('mock.mockers.websocket.certContent')">
          <a-textarea 
            v-model="mock.options.sslCert" 
            placeholder="-----BEGIN CERTIFICATE-----" 
            :rows="3"
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
}
</script>