<template>
  <a-modal 
    v-if="enable" 
    v-model="enable" 
    :title="$t('directive.share.modalTitle')"
  >
    <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
      <a-form-item :label="$t('directive.share.withResponse')">
        <a-checkbox v-model="withResponse"></a-checkbox>
      </a-form-item>
    </a-form>
    <div class="border-top pt-3">
      <a-input-group compact class="w-100">
        <a-input style="width:20%" :value="$t('directive.share.link')" read-only class="text-body bg-light"/>
        <a-input style="width:70%" read-only v-model="link"/>
        <a-button ref="btnLinkCopy"
          style="width:10%" 
          :disabled="null == link" 
          @click="actionCopy"
        ><a-icon type="copy" /></a-button>
      </a-input-group>
      <div v-if="null != link"><small>{{$t('directive.share.expiredAt')}} : {{expiredAt}}</small></div>
    </div>

    <template slot="footer">
      <a-button key="back" @click="enable = false">{{$t('button.cancel')}}</a-button>
      <a-button ref="btnGenLink" type="primary" :disabled="null != link" @click="actionOk">
        {{$t('directive.share.generateLink')}}
      </a-button>
    </template>
  </a-modal>
</template>
<script>
export default {
    name : 'DirectiveShare',
    props : {
        /**
         * @property {Object}
         */
        directive : {},
        /**
         * @property {Buffer}
         */
        response : {},
    },
    data() {
        return {
            enable : false,
            withResponse : true,
            link : null,
            expiredAt : '',
        };
    },
    methods : {
        /**
         * @param {MdbDirective} directive
         */
        execute() {
            this.link = null;
            this.enable = true;
        },

        /**
         * event handler on click ok button
         */
        async actionOk() {
            let data = this.directive.getData();
            data.responseData = null;
            if ( null != this.response && this.withResponse ) {
                data.responseData = Buffer.from(this.response).toString('base64');
            }

            let share = {};
            share.type = 'directive';
            share.data = JSON.stringify(data);
            let response = await this.$bittly.shareCreate(share);
            if ( !response.success ) {
                this.$message.error(response.message);
                return;
            }

            this.link = response.data.link;
            this.expiredAt = response.data.expired_at;
        },

        /**
         * copy link address to clipboard
         */
        actionCopy() {
            let $this = this;
            navigator.clipboard.writeText(this.link).then(() => {
                $this.$message.success(this.$t('directive.share.linkCopied'));
                $this.enable = false;
            });
        }
    },
}
</script>