<template>
  <a-modal v-if="enabled" v-model="enabled" :title="$t('app.setting.title')" :footer="null">
    <a-form-model :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
      <a-form-model-item :label="$t('app.setting.language')">
        <a-select ref="sltLanguage" v-model="language" @change="actionLanguageChange">
          <a-select-option value="zh">简体中文</a-select-option>
          <a-select-option value="en">English</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import MdbRuntimeVariable from '../models/MdbRuntimeVariable';
export default {
    data() {
        return {
            enabled : false,
            language : this.$i18n.locale,
        };
    },
    methods : {
        /**
         * init setting modal
         */
        async show() {
            this.language = await MdbRuntimeVariable.getVarValue('app_language', this.$i18n.locale);
            this.enabled = true;
        },

        /**
         * update language
         */
        async actionLanguageChange() {
            this.$i18n.locale = this.language;
            await MdbRuntimeVariable.setVarValue('app_language', this.language);
        },
    }
}
</script>