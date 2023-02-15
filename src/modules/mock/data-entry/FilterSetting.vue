<template>
  <div class="d-inline-block">
    <a-button size="small" icon="filter" @click="actionEnable"></a-button>
    <a-modal v-model="enable" 
      :title="$t('mock.response.fileter.settingTitle')"
      :okText="$t('button.ok')"
      :cancelText="$t('button.cancel')"
      @ok="actionOk"
    >
      <a-form :label-col="{span:4}" :wrapper-col="{span:18}">
        <!-- dir -->
        <a-form-item :label="$t('mock.response.fileter.direction')">
          <a-radio-group v-model="filter.direction" button-style="solid">
            <a-radio-button value="all">{{$t('mock.response.fileter.directionAll')}}</a-radio-button>
            <a-radio-button value="send">{{$t('mock.response.fileter.directionSend')}}</a-radio-button>
            <a-radio-button value="receive">{{$t('mock.response.fileter.directionReceive')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- name -->
        <a-form-item :label="$t('mock.response.fileter.ruleName')">
          <a-auto-complete v-model="filter.name" :data-source="names"
          ><a-input :allowClear="true"/></a-auto-complete>
        </a-form-item>

        <!-- content -->
        <a-form-item :label="$t('mock.response.fileter.dataContent')">
          <a-input v-model="filter.content" :allowClear="true"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import MyObject from '../../../utils/datatype/MyObject';
export default {
    name : 'MockTCPFilterSetting',
    props : {
        /**
         * value of fileter
         * @property {Object}
         */
        value : {},
        /**
         * list of match rules
         * @property {Arrayy<String>}
         */
        matchRules:{},
        /**
         * list of snippets
         * @property {Arrayy<String>}
         */
        snippets : {},
    },
    data() {
        return {
            /**
             * indicate whether is filter modal enable
             * @property {Boolean}
             */
            enable : false,
            /**
             * list of entry names
             * @property {Array<String>}
             */
            names : [],
            /**
             * settings of filter
             * @property {Object}
             */
            filter : {},
        };
    },
    methods: {
        /**
         * enable to filter setting
         */
        actionEnable () {
            this.filter = {direction:'all'};
            if ( undefined !== this.value ) {
                this.filter = MyObject.copy(this.value);
            }

            this.names = [];
            if ( Array.isArray(this.snippets) ) {
                this.snippets.forEach(item => this.names.push(item.name));
            }
            if ( Array.isArray(this.matchRules) ) {
                this.matchRules.forEach(item => this.names.push(item.name));
            }
            this.names = this.names.filter(name => name && 0 < name.length);

            this.enable = true;
        },

        /**
         * action handler on setting ok
         */
        actionOk() {
            this.$emit('input', MyObject.copy(this.filter));
            this.$emit('change');
            this.enable = false;
        },
    }
}
</script>