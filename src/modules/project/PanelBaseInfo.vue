<template>
  <div class="bg-white h-100">
    <a-page-header class="border-bottom mb-4" :title="$t('project.panelBaseInfo.title')" />
    
    <a-form v-if="null != project" :label-col="{ span: 3 }" :wrapper-col="{ span: 16 }">
      <!-- name -->
      <a-form-item :label="$t('project.name')" 
        :validate-status="project.hasError('name') ? 'error' : ''"
        :help="project.getErrorSummary('name')"
      >
        <a-input 
          ref="inputName"
          v-model="project.name" 
          :max-length="project.getAttributeProp('name', 'maxLength', 64)"
        />
      </a-form-item>

      <!-- description -->
      <a-form-item :label="$t('project.description')">
        <a-textarea 
          ref="inputDesc"
          v-model="project.description" 
          :rows="4" 
          :max-length="project.getAttributeProp('description', 'maxLength', 1024)"
        />
      </a-form-item>

      <!-- endianness -->
      <a-form-item :label="$t('directive.endiannessLabel')">
        <a-radio-group button-style="solid" v-model="project.endianness">
          <a-radio-button value="big-endian">
            {{$t('directive.endiannessBigEndian')}}
          </a-radio-button>
          <a-radio-button value="little-endian">
            {{$t('directive.endiannessLittleEndian')}}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>

      <!-- charset -->
      <a-form-item :label="$t('project.charset')">
        <a-select v-model="project.charset" default-value="utf8">
          <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
          >{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>

      <!-- default target -->
      <a-form-item :label="$t('project.defaultTargetType')">
        <a-select v-model="project.defaultTargetType">
          <a-select-option v-for="(targetConfig, targetKey) in targetEditors" :key="targetKey" :value="targetKey"
          >{{targetConfig.name}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 12, offset: 3 }">
        <a-button type="primary" @click="actionSave"> {{$t('button.save')}} </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import TargetEditorRegistryMixin from '../directive/communicators/TargetEditorRegistryMixin.js'
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'PanelBaseInfo',
    mixins : [ComponentProjectMixin,TargetEditorRegistryMixin],
    methods : {
        /**
         * event handler on save button clicked.
         */
        async actionSave() {
            if ( !await this.project.save() ) {
                this.$message.error(this.$t('messages.saveFailed'));
                this.$forceUpdate();
                return;
            }

            this.$eventBus.$emit('project-current-update');
            this.$message.success(this.$t('messages.saveSuccess'));
        }
    },
}
</script>