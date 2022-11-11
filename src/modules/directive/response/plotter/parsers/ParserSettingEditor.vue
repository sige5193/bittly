<template>
  <div v-if="enable" class="d-inline-block">
    <a-button ref="btnOpen" size="small" @click="actionSettingEnable">{{$t('button.setting')}}</a-button>
    
    <a-modal ref="modalSetting"
      v-if="settingEnable" 
      v-model="settingEnable" 
      :title="$t('button.setting')"
      :width="width"
      :bodyStyle="bodyStyle"
    >
      <slot></slot>

      <template slot="footer">
        <a-row>
          <a-col :span="12" class="text-left"><slot name="extActions"></slot></a-col>
          <a-col :span="12">
            <a-button @click="settingEnable = false">{{$t('button.cancel')}}</a-button>
            <a-button ref="btnOK" type="primary" @click="actionOk">{{$t('button.ok')}}</a-button>
          </a-col>
        </a-row>
      </template>
    </a-modal>
  </div>
</template>
<script>
export default {
    name : 'DirectiveResponsePlotterParserSettingEditor',
    props : {
        /**
         * @property {Boolean}
         */
        enable : {default : true},
        width: {type:Number,default:520},
        bodyStyle : {type:Object,default:()=>{return {};}}
    },
    data() {
        return {
            /**
             * indicate if setting modal enabled
             * @property {Boolean}
             */
            settingEnable : false,
        };
    },
    methods : {
        /**
         * enable setting modal and setup parent.
         */
        actionSettingEnable() {
            this.settingEnable = true;
        },

        /**
         * event handler on done setting.
         */
        actionOk() {
            this.$parent.settingOk();
            this.settingEnable = false;
        },
    },
}
</script>