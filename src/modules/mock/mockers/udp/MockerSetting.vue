<template>
  <a-modal v-if="enable" v-model="enable"
    :closable="false"
    :keyboard="false"
    :maskClosable="false" 
    :title="$t('mock.mockers.serialport.settingTitle')"
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
export default {
    name : 'MockMockMockSetting',
    props : {
        /**
         * mock instance to edit
         * @property {Object}
         */
        value : {type:Object},
    },
    data() {
        return {
            /**
             * indicate if setting enabled.
             * @property {Boolean}
             */
            enable : false,
            /**
             * instance of mock model
             * @property {MdbMock}
             */
            mock : null,
        };
    },
    methods : {
        /**
         * open setting modal
         * @public
         */
        open() {
            this.mock = this.value;
            this.enable = true;
        },

        /**
         * event handler on done setting
         */
        async actionOk() {
            let isSuccess = await this.mock.save();
            if ( !isSuccess ) {
                throw Error('Failed to save mock model');
            }
            this.$emit('change');
            this.enable = false;
        },
    },
}
</script>