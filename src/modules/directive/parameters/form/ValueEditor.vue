<template>
  <div>
    <!-- empty -->
    <a-empty v-if="0 == content.length" :description="$t('directive.parameter.form.fieldNotConfigured')"/>

    <!-- form value editor -->
    <a-row v-for="(item, index) in content" :key="index" class="mt-1 bg-light pl-1 rounded" style="line-height:30px !important;">
      <!-- column name -->
      <a-col :span="6" style="line-height: 32px;">
        <span v-if="0 == item.name.length"> {{$t('messages.untitled')}} </span>
        <span v-else>{{item.name}}</span>
      </a-col>
      
      <!-- column value -->
      <a-col :span="18" class="text-right">
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
          <a-tooltip slot="suffix">
            <template slot="title">
              {{$t('messages.note')}} : {{item.desc}}<br/>
              {{$t('directive.parameter.form.dataTypeLabel')}} : 
              {{$t(`directive.parameter.form.dataType.${item.type}`)}}
            </template>
            <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
          </a-tooltip>

          <a-dropdown v-if="null !== quickInput" slot="addonAfter" :trigger="['click']" placement="bottomRight">
            <span><a-icon type="select" /></span>
            <a-menu slot="overlay" @click="(event) => actionQuickInputMenuItemClick(event, index)">
              <a-menu-item v-for="quickInputItem in quickInput" :key="quickInputItem.value">
                {{quickInputItem.label}}
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-input>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import Common from '@/utils/Common.js'
export default {
    name : 'DirectiveParameterValueEditor',
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
         * init v-model
         */
        initVModel() {
            this.content = [];
            if ( !Common.isEmpty(this.value) ) {
                this.content = this.value;
                return this.actionContentInput();
            }
            
            if ( Common.isEmpty(this.directive.requestContent.form) ) {
                this.content = [];
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