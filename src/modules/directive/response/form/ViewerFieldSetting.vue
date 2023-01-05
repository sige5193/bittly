<template>
  <div class="d-inline-block">
    <a-icon type="setting" class="mr-1 cursor-pointer" @click="actionSetting"/>
    <a-modal v-if="enable" v-model="enable" 
      :title="$t('directive.parameter.form.fieldSetting')" 
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionOk"
    >
      <a-form :label-col="{span:4}" :wrapper-col="{span:16}">
        <a-form-item :label="$t('directive.response.form.expression')">
          <a-input v-model="setting.expression"/>
        </a-form-item>
        <a-form-item :label="$t('directive.endiannessLabel')">
          <a-radio-group v-model="setting.endianness" button-style="solid" @change="actionUpdate">
            <a-radio-button value="default">{{$t('directive.parameter.form.fieldEndiannessDefault')}}</a-radio-button>
            <a-radio-button value="big-endian">{{$t('directive.endiannessBigEndian')}}</a-radio-button>
            <a-radio-button value="little-endian">{{$t('directive.endiannessLittleEndian')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject';
export default {
    name : 'DirectiveResponseFormFieldSetting',
    props : {
        /**
         * @property {Object}
         */
        value : {},
    },
    data() {
        return {
            /**
             * @property {Boolean}
             */
            enable : false,
            /**
             * @property {Object|null}
             */
            setting : null,
        };
    },
    methods : {
        /**
         * open setting modal
         */
        actionSetting() {
            this.setting = MyObject.copy(this.value);
            this.setting.endianness = this.setting.endianness || 'default';
            this.enable = true;
        },
        
        /**
         * done editting
         */
        actionOk() {
            this.$emit('input', MyObject.copy(this.setting));
            this.$emit('change');
            this.enable = false;
        },

        /**
         * 
         */
        actionUpdate() {
            this.$forceUpdate();
        }
    },
}
</script>