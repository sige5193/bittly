<template>
  <a-layout class="h-100">
    <!-- entry menu  -->
    <a-layout-sider class="bg-white border-right" width="300">
      <directive-entries
        ref="entryMenu"
        :projectId="curProjectId"
         @directive-click="actionDirectiveClicked"
      ></directive-entries>
    </a-layout-sider>

    <!-- no active directive -->
    <a-layout-content v-if="null == directive" class="h-100 bg-white pt-5">
      <a-empty :description="false" />
    </a-layout-content>

    <!-- document detail -->
    <a-layout-content class="bg-white p-2 d-flex flex-dir-column" v-if="null != directive">
      <a-page-header
        ref="header"
        style="border: 1px solid rgb(235, 237, 240)"
        :title="directive.name"
      ></a-page-header>
      
      <div class="doc flex-grow h-0 overflow-auto">
        <div v-if="directive.description.trim().length > 0" class="mt-3">{{directive.description}}</div>
        <a-row v-if="directive.attributes.length > 0" class="mt-3">
          <a-col :span="6" v-for="(attr,index) in directive.attributes" :key="index">
            <strong>{{attr.name}}：</strong>
            {{attr.value}}
          </a-col>
        </a-row>

        <div v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FORM', directive.requestFormat)" class="mt-4">
          <h5>{{$t('document.requestParams')}} :</h5>
          <ul class="m-0 p-0 pl-4">
            <li v-for="(param,index) in directive.requestContent.form" :key="index" class="mb-3">
              <div>
                <a-tag>
                  <span v-if="0 != param.name.trim().length">{{param.name}}</span>
                  <span v-else>${{index}}</span>
                </a-tag> : 
                [ {{$t(`directive.parameter.form.dataType.${param.type}`)}} ]
              </div>
              <div class="mt-1">
                {{param.desc}} &nbsp;&nbsp;
                {{$t('document.requestParamExample')}} : 
                {{param.value}}
              </div>
            </li>
          </ul>
        </div>
        
        <div v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','HEX', directive.requestFormat)" class="mt-4">
          <h5>{{$t('document.requestParamsCotnent')}}</h5>
          <div class="request-param-raw">{{directive.requestContent.hex}}</div>
        </div>

        <div v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','TEXT', directive.requestFormat)" class="mt-4">
          <h5>{{$t('document.requestParamsCotnent')}}</h5>
          <div class="request-param-raw">{{directive.requestContent.text}}</div>
        </div>

        <div v-if="$dict.match('DIRECTIVE_PARAM_FORMAT','FILE', directive.requestFormat)" class="mt-4">
          <h5>{{$t('document.requestParamsCotnent')}}</h5>
          <div class="request-param-raw"><a-icon type="file" /> {{directive.requestContent.file}}</div>
        </div>
        
        <div v-if="undefined != directive.responseFormatter.fields" class="mt-4">
          <h5>{{$t('document.responseHeader')}} : </h5>
          <ul class="m-0 p-0 pl-4">
            <li v-for="(item, index) in directive.responseFormatter.fields" :key="index" class="mb-3">
              <div>
                <a-tag>
                  <span v-if="0 != item.name.trim().length">{{item.name}}</span>
                  <span v-else>${{index}}</span>
                </a-tag> : 
                [ {{$t(`directive.parameter.form.dataType.${item.type}`)}} ]
              </div>
              <div class="mt-1">{{item.desc}}</div>
            </li>
          </ul>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import DirectiveEntries from './DirectiveEntries.vue'
export default {
    name : 'MainDocument',
    mixins : [ProjectMixin],
    components : {
        'directive-entries' : DirectiveEntries,
    },
    data() {
        return {
            directive : null,
        };
    },
    created() {
        this.$store.commit('moduleIdSet', 'document');
    },
    methods : {
        /**
         * event handler on entry menu item click.
         * @param {MdbDirective} directive
         */
        async actionDirectiveClicked(directive) {
            this.directive = directive;
        },
    }
}
</script>
<style scoped>
.request-param-raw {background: #e3e3e3;padding: 1em;font-size: 1.2em;}
</style>