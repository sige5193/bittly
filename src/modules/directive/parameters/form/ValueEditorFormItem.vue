<template>
  <div>
    <a-form-item v-for="(item, index) in content" :key="index" 
      class="mb-0"
      label-align="left"
    >
      <!-- label -->
      <span slot="label">
        <a-icon type="edit" /> 
        <span class="ml-1 mr-1">
          <span v-if="0 === item.name.trim().length">${{index+1}}</span> 
          <span v-else>{{item.name}}</span> 
        </span>
        <a-tooltip>
          <template slot="title">
            {{$t(`directive.parameter.form.dataType.${item.type}`)}}
            <span v-if="0 == $dict.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'length',0)">[{{item.length}}]</span>
            <br/>
            {{item.desc}}
          </template>
          <small><a-icon class="text-muted" type="question-circle" /></small>
        </a-tooltip>
      </span>
      <div>
        <!-- file -->
        <a-upload :ref="`uploadFile_${index}`" v-if="$dict.match('DIRECTIVE_PARAM_DATATYPE','FILE', item.type)"
          :multiple="false" :beforeUpload="() => false" :showUploadList="false"
          @change="actionValueFileChange($event, index)"
        >
          <a-button class="directive-parameter-form-value-editor-file-button">
            <a-icon type="file" /> 
            <span v-if="0 == content[index].value.length">{{$t('directive.parameter.file.select')}}</span>
            <span v-else>{{content[index].value}}</span>
          </a-button>
        </a-upload>

        <!-- basic data -->
        <a-input v-else :ref="`inputValue_${index}`" :addon-before="item.prefix" 
          v-model="content[index].value" @input="actionContentInput"
        >
          <a-dropdown v-if="null !== quickInput" slot="addonAfter" :trigger="['click']" placement="bottomRight">
            <span><a-icon type="select" /></span>
            <a-menu slot="overlay" @click="(event) => actionQuickInputMenuItemClick(event, index)">
              <a-menu-item v-for="quickInputItem in quickInput" :key="quickInputItem.value">
                {{quickInputItem.label}}
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-input>
      </div>
    </a-form-item>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'DirectiveParameterValueEditorFormItem',
    props : {
        /**
         * the value to hold parameter values
         * @property {Object}
         */
        value:{}, 
        /**
         * directive instance
         * @property {Object}
         */
        directive : {},
        /**
         * @property {Array|null}
         */
        quickInput : {default:null},
    },
    data() {
        return {
            /**
             * @property {Array<Object>}
             */
            content : [],
        };
    },
    mounted() {
        this.initVModel();
    },
    methods : {
        /**
         * refresh parameter editor
         * @public
         */
        refresh() {
            this.content = [];
            if ( Common.isEmpty(this.directive.requestContent.form) ) {
                return this.actionContentInput();
            }

            for ( let i=0; i<this.directive.requestContent.form.length; i++ ) {
                let item = this.directive.requestContent.form[i];
                let prefix = null;
                if ( true === this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',item.type,'formatable',false) ) {
                    prefix = this.$dict.voption('DIRECTIVE_PARAM_BYTE_FORMATTER',item.format,'prefix','');
                }
                this.content.push({
                    name : item.name,
                    type : item.type,
                    value : item.value,
                    format : item.format,
                    prefix : prefix,
                });
            }
            return this.actionContentInput();
        },

        /**
         * init v-model
         */
        initVModel() {
            if ( !Common.isEmpty(this.value) ) {
                this.content = this.value;
                return this.actionContentInput();
            }
            this.refresh();
        },

        /**
         * update parameters value
         */
        actionContentInput() {
            this.$emit('input', this.content);
            this.$forceUpdate();
        },

        /**
         * event handler on field file changed
         */
        actionValueFileChange(event, index) {
            this.content[index].value = event.file.path;
            this.actionContentInput();
        },

        /**
         * event handler to handle quick input item
         */
        actionQuickInputMenuItemClick( event, index ) {
            this.content[index].value = event.key;
            this.actionContentInput();
        }
    }
}
</script>
<style>
.directive-parameter-form-value-editor-file-button span {
    width: 200px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
}
</style>