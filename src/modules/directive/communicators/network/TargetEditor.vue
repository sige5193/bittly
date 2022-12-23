<!--
 - target editor for network
 - @author sige
--> 
<template>
  <a-row>
    <!-- protocol -->
    <a-col :span="5" class="pr-1">
      <a-input-group compact class="my-input-group">
        <span class="label">{{$t('directive.communicator.network.protocol')}}</span>
        <a-select ref="protocol" class="input" v-model="target.protocol" @change="actionUpdateTarget(true)">
          <a-select-option value="TCP">TCP</a-select-option>
          <a-select-option value="UDP">UDP</a-select-option>
        </a-select>
      </a-input-group>
    </a-col>

    <!-- host -->
    <a-col :span="10" class="pr-1">
      <a-input 
        ref="host" 
        :addon-before="$t('directive.communicator.network.address')" 
        v-model="target.host" 
        @change="actionUpdateTarget(true)" 
      />
    </a-col>
    
    <!-- port -->
    <a-col :span="4" class="pr-1">
      <a-input 
        ref="port" 
        :addon-before="$t('directive.communicator.network.port')" 
        v-model="target.port" 
        @change="actionUpdateTarget(true)" 
      />
    </a-col>
  </a-row>
</template>
<script>
import Communicator from './Communicator.js'
import TargetEditorMixin from '../TargetEditorMixin.js'
import MyObject from '../../../../utils/datatype/MyObject.js';
export default {
    name : 'Network',
    mixins : [TargetEditorMixin],
    mounted() {
        this.initTarget();
    },
    methods : {
        /**
         * init target model
         */
        initTarget() {
            let hasChanged = MyObject.applyDefaultValues(this.target, {
                protocol : 'TCP',
            });
            if ( hasChanged ) {
                this.updateVModel();
            }
            this.$forceUpdate();
            this.isEditorInited = true;
        },

        /**
         * get device key by options use to close device after options change.
         * @overide
         * @param {Object} options
         * @returns {String}
         */
        getComKeyByOptions(options) {
            return Communicator.generateKeyFromOptions(options);
        },
    },
    /**
     * editor config
     */
    editorConfig() {
        return {
            name : 'Network',
            label : window.app.$t('directive.communicator.network.name'),
            defaultDataType:'byte',
            defaultResponseViewer : 'hex'
        };
    }
}
</script>