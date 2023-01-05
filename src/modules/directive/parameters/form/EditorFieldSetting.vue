<template>
  <div class="d-inline-block">
    <a-icon type="setting" class="mr-1 cursor-pointer" @click="actionSetting"/>
    <a-modal v-if="enable" v-model="enable" 
      :title="$t('directive.parameter.form.fieldSetting')" 
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionOk"
    >
      <a-form layout="vertical">
        <!-- value options -->
        <a-form-item :label="$t('directive.parameter.form.fieldValueSelectOptions')">
          <div v-for="(option, optIndex) in setting.valueOptions" :key="optIndex" class="mb-1">
            <a-input-group compact>
              <a-input class="w-45" 
                v-model="setting.valueOptions[optIndex].name" 
                :placeholder="$t('directive.parameter.form.fieldValueSelectOptionName')"
                @input="actionSelectOptionInput(optIndex)"
              />
              <a-input class="w-45"
                v-model="setting.valueOptions[optIndex].value" 
                :placeholder="$t('directive.parameter.form.fieldValueSelectOptionValue')"
                @input="actionSelectOptionInput(optIndex)"
              />
              <a-button class="w-10" @click="actionSelectOptionDelete(optIndex)"><a-icon type="delete" /></a-button>
            </a-input-group>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    name : 'DirectiveParameterFormFieldSetting',
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
            if ( !this.setting.valueOptions ) {
                this.setting.valueOptions = [];
            }
            this.setting.valueOptions.push({name:'',value:''});
            this.enable = true;

            console.log(this.form);
        },
        
        /**
         * done editting
         */
        actionOk() {
            let valueOptionValues = [];
            for ( let i=0; i<this.setting.valueOptions.length; i++ ) {
                let item = this.setting.valueOptions[i];
                if ( -1 === valueOptionValues.indexOf(item.value) ) {
                    valueOptionValues.push(item.value);
                    continue;
                }
                this.$error({
                    title: this.$t('directive.parameter.form.fieldSettingFailed'),
                    content: this.$t('directive.parameter.form.fieldValueSelectOptionValueDuplicate',[item.value]),
                    okText: this.$t('button.ok'),
                });
                return;
            }
            
            this.setting.valueOptions.pop();
            this.$emit('input', MyObject.copy(this.setting));
            this.$emit('change');
            this.enable = false;
        },

        /**
         * event handler on value option value inputed.
         * @param {Number} index
         */
        actionSelectOptionInput(index) {
            if ( index === this.setting.valueOptions.length - 1 ) {
                this.setting.valueOptions.push({name:'',value:''});
            }
            this.$forceUpdate();
        },

        /**
         * remove value option item from list.
         * @param {Number} index
         */
        actionSelectOptionDelete(index) {
            if ( index === this.setting.valueOptions.length - 1 ) {
                this.setting.valueOptions.push({name:'',value:''});
            }
            this.setting.valueOptions.splice(index,1);
            this.$forceUpdate();
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