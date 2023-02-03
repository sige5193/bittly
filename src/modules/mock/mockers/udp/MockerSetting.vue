<template>
  <a-modal v-if="enable" v-model="enable"
    :closable="false"
    :keyboard="false"
    :maskClosable="false" 
    :title="$t('mock.mockers.udp.settingTitle')"
  >
    <a-form :label-col="{span:4}" :wrapper-col="{span:17}">
      <a-form-item :label="$t('mock.name')">
        <a-input v-model="mock.name" @input="forceUpdate"/>
      </a-form-item>
      
      <!-- host -->
      <a-form-item :label="$t('mock.mockers.udp.host')">
        <a-input v-model="mock.options.host" @input="forceUpdate"/>
      </a-form-item>
      
      <!-- port -->
      <a-form-item :label="$t('mock.mockers.udp.port')">
        <a-input v-model="mock.options.port" @input="forceUpdate"/>
      </a-form-item>

      <!-- data format -->
      <a-form-item :label="$t('mock.mockers.udp.encoding')">
        <a-radio-group v-model="mock.options.encoding" button-style="solid" @change="forceUpdate">
          <a-radio-button value="text">TEXT</a-radio-button>
          <a-radio-button value="hex">HEX</a-radio-button>
        </a-radio-group>
      </a-form-item>
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
         * @param {*} options 
         */
        initOptions( options ) {
            options.host = '127.0.0.1';
            options.port = '8899';
            options.encoding = 'text';
        },

        /**
         * generate summary by options
         * @param {Object} options 
         * @returns 
         */
        generateSummary( options ) {
            return `${options.host}:${options.port}`;
        }
    }
}
</script>