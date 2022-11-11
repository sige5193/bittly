<template>
  <div class="d-inline-block mr-1">
    <a-button @click="actionEnable" :disabled="!enable">
      <a-icon type="setting" />
    </a-button>

    <a-modal v-if="modalEnable" v-model="modalEnable" :title="$t('app.toolWsServer.settingModalTitle')" 
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionOk"
    >
      <a-form>
        <!-- pem key -->
        <a-form-item :label="$t('app.toolWsServer.keyContent')">
          <a-textarea 
            v-model="editing.sslKey" 
            placeholder="-----BEGIN RSA PRIVATE KEY-----" 
            :rows="3"
            @change="actionForceUpdate" 
          />
        </a-form-item>
        
        <!-- cert content -->
        <a-form-item :label="$t('app.toolWsServer.certContent')">
          <a-textarea 
            v-model="editing.sslCert" 
            placeholder="-----BEGIN CERTIFICATE-----" 
            :rows="3"
            @change="actionForceUpdate" 
          />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>
<script>
export default {
    name : 'ToolWsServerModalSetting',
    props : {
        /**
         * @property {Object}
         */
        options : Object,
        /**
         * @property {Boolean}
         */
        enable : Boolean,
    },
    data() {
        return {
            modalEnable : false,
            editing : {
                sslKey : null,
                sslCert : null,
            },
        };
    },
    methods : {
        /**
         * enable setting modal
         */
        actionEnable() {
            this.editing.sslKey = this.options.sslKey;
            this.editing.sslCert = this.options.sslCert;
            this.modalEnable = true;
            this.$forceUpdate();
        },

        /**
         * update view
         */
        actionForceUpdate() {
            this.$forceUpdate();
        },

        /**
         * event handler on setting done
         */
        actionOk() {
            this.$emit('ok', this.editing);
            this.modalEnable = false;
        },
    },
}
</script>