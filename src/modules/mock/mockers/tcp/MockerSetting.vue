<template>
  <a-modal v-if="enable" v-model="enable"
    :closable="false"
    :keyboard="false"
    :maskClosable="false" 
    :title="$t('mock.mockers.tcp.settingTitle')"
  >
    <a-form :label-col="{span:4}" :wrapper-col="{span:17}">
      <a-form-item :label="$t('mock.name')">
        <a-input v-model="mock.name" />
      </a-form-item>
      
      <!-- host -->
      <a-form-item :label="$t('mock.mockers.tcp.host')">
        <a-input v-model="mock.options.host"/>
      </a-form-item>
      
      <!-- port -->
      <a-form-item :label="$t('mock.mockers.tcp.port')">
        <a-input v-model="mock.options.port"/>
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
    name : 'MockMockerTcpSetting',
    mixins : [MockerSettingBase],
}
</script>