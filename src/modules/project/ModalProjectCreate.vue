<template>
  <div>
    <a-modal 
      v-if="enable" 
      :visible="enable"
      :bodyStyle="{padding:0}"
      :closable="false"
    >
      <a-tabs default-active-key="create" v-model="action">
        <!-- 本地项目创建 -->
        <a-tab-pane key="create" :tab="$t('project.createTabTitle')">
          <a-form :form="createForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
            <a-form-item :label="$t('project.name')">
              <a-input v-decorator="['name', createFormNameValidation]" />
            </a-form-item>

            <a-form-item :label="$t('project.description')">
              <a-textarea :rows="4" v-decorator="['description', createFormDescValidation]" />
            </a-form-item>

            <!-- endianness -->
            <a-form-item :label="$t('project.endianness')">
              <a-radio-group button-style="solid" 
                v-decorator="['endianness', {rules:[],initialValue:'big-endian'}]"
              >
                <a-radio-button value="big-endian">
                {{$t('directive.endiannessBigEndian')}}
                </a-radio-button>
                <a-radio-button value="little-endian">
                {{$t('directive.endiannessLittleEndian')}}
                </a-radio-button>
              </a-radio-group>
            </a-form-item>

            <a-form-item :label="$t('project.charset')">
              <a-select v-decorator="['charset', {rules:[],initialValue:'utf8'}]">
                <a-select-option v-for="(item, key) in $dict.items('CHARSET')" :key="key" :value="item.value"
                >{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item :label="$t('project.defaultTargetType')">
              <a-select v-decorator="['defaultTargetType', {rules:[],initialValue:'SerialPort'}]">
                <a-select-option v-for="(targetConfig, targetKey) in targetEditors" :key="targetKey" :value="targetKey"
                >{{targetConfig.name}}</a-select-option>
              </a-select>
            </a-form-item>

          </a-form>
        </a-tab-pane>

        <!-- 下载项目 -->
        <a-tab-pane key="clone" :tab="$t('project.downloadTabTitle')" force-render class="pl-3 pr-3 pb-3">
          <a-input-search :placeholder="$t('project.downloadSearch')" @search="actionCloneSearch"/>
          <div class="clone-search-result mt-1 mb-1 pr-1">
            <a-empty v-if="0 == downloadSearchedProjects.length" :description="false" class="mt-5 mb-5" />
            <div 
              v-for="(project, pIndex) in downloadSearchedProjects" 
              :key="pIndex" 
              class="clone-search-result-item border-bottom mt-3 pb-1"
              @click="actionCloneSearchResuleClick(pIndex)"
            >
              <div>
                <strong>{{project.user.account}} / {{project.name}}</strong>
                <a-radio :checked="downloadSelectedProjectIndex === pIndex" class="float-right"></a-radio>
              </div>
              <div class="text-small mt-1 text-muted">
                <span>{{$t('project.downloadVersion')}} : {{project.version}}</span> &nbsp;&nbsp;&nbsp;
                <span >{{$t('project.downloadLastUpdateTime')}} : {{project.last_published_at}}</span>
              </div>
              <div class="text-muted text-small mt-1">{{project.description}}</div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>

      <template slot="footer">
        <div v-if="'create' == action">
          <a-button @click="actionNewProjectCancel">{{$t('button.cancel')}}</a-button>
          <a-button type="primary" @click="actionNewProjectSave">{{$t('button.create')}}</a-button>
        </div>
        <div v-if="'clone' == action">
          <a-button @click="actionNewProjectCancel">{{$t('button.cancel')}}</a-button>
          <a-button type="primary" @click="actionExecuteDownload">{{$t('project.downloadButtonDownload')}}</a-button>
        </div>
      </template>
    </a-modal>

    <a-modal v-model="downloadingProgressEnable" :title="null" :closable="false" :footer="null">
      <a-progress :percent="downloadingProgress" />
    </a-modal>

  </div>
</template>
<script>
import TargetEditorRegistryMixin from '../directive/communicators/TargetEditorRegistryMixin.js'
import { v4 as uuidv4 } from 'uuid';
import MdbProject from '../../models/MdbProject.js'
export default {
    name : 'ModalProjectCreate',
    mixins : [TargetEditorRegistryMixin],
    data() {
        return {
            enable : false,
            action : 'create',
            project : null,
            actResolve : null,
            actReject : null,
            downloadingProgress : 0,
            downloadingProgressEnable : false,
            downloadSearchedProjects : [],
            downloadSelectedProjectIndex : null,

            createForm : this.$form.createForm(this, { name: 'create' }),
            createFormNameValidation : null,
            createFormDescValidation : null,
        };
    },
    created() {
        this.setupFormValidators();
    },
    methods : {
        /**
         * 配置表单验证
         */
        setupFormValidators() {
            this.createFormNameValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {max:64,min:4, message : this.$t('project.createNameLengthErrorMessage') },
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                ]
            };
            this.createFormDescValidation = {
                rules : [
                    {max:1024, message : this.$t('project.createDescLengthErrorMessage') },
                ],
            };
        },

        /**
         * 打开弹框
         */
        open() {
            this.enable = true;
            this.downloadSearchedProjects = [];
            this.downloadSelectedProjectIndex = null;

            this.project = new MdbProject();
            this.project.uuid = uuidv4();
            let $this = this;
            return new Promise(function( resolve, reject ) {
                $this.actResolve = resolve;
                $this.actReject = reject;
            });
        },

        /**
         * 本地项目保存
         */
        async actionNewProjectSave() {
            let $this = this;
            this.createForm.validateFields(async (error, values) => {
                if ( null != error ) {
                    return;
                }
                console.log(values);
                $this.project = new MdbProject();
                $this.project.setAttributes(values);
                if ( !await $this.project.save() ) {
                    $this.$message.error(this.$t('messages.saveFailed'));
                    $this.$forceUpdate();
                    return;
                }

                $this.enable = false;
                $this.actResolve($this.project);
            });
        },

        /**
         * 项目下载搜索项目
         */
        async actionCloneSearch( value ) {
            if ( this.$bittly.isGuest() ) {
                this.$eventBus.$emit('user-login-required');
                return ;
            }

            this.downloadSelectedProjectIndex = null;
            this.downloadSearchedProjects = [];

            let searchParams = {};
            searchParams.text = value;
            let searchResponse = await this.$bittly.projectSearch(searchParams);
            if ( !searchResponse.success ) {
                this.$message.error(searchResponse.message);
                return;
            }
            this.downloadSearchedProjects = searchResponse.data.projects;
        },

        /**
         * 执行项目下载
         */
        async actionExecuteDownload() {
            if ( null === this.downloadSelectedProjectIndex ) {
                this.$message.error(this.$t('project.downloadNoProjectSelected'));
                return ;
            }

            let remoteProject = this.downloadSearchedProjects[this.downloadSelectedProjectIndex];
            let uuid = remoteProject.uuid;
            let projectExists = await MdbProject.findOne({remote_uuid:uuid});
            if ( null != projectExists ) {
                this.$message.error(this.$t('project.downloadProjectDownloaded'));
                return ;
            }

            let version = remoteProject.version;
            let contentResponse = null;
            contentResponse = await this.$bittly.projectVersionContentGet(uuid, version);
            if ( !contentResponse.success ) {
                this.$message.error(this.$t('project.downloadUnableToGetProjectData'));
                return ;
            }

            this.downloadingProgress = 0;
            this.downloadingProgressEnable = true;
            this.project = new MdbProject();
            
            let $this = this;
            let content = JSON.parse(contentResponse.data.content);
            try {
                MdbProject.transactionBegin();
                await this.project.applyPublishData(content, function ( step ) {
                    $this.downloadStepCallback(step);
                });
                this.project.sourceUuid = uuid;
                await this.project.save();
                MdbProject.transactionCommit();
                
                this.enable = false;
                this.actResolve(this.project);
            } catch ( e ) {
                MdbProject.transactionRollback();
                this.$message.error(this.$t('project.downloadFailed',[e]));
            }

            this.downloadingProgress = 100;
            this.downloadingProgressEnable = false;
        },

        /**
         * 步骤回调
         */
        downloadStepCallback( step ) {
            let progressMap = {
                'project' : 10,
                'directive' : 20,
                'directive-folder' : 30,
                'directive-entry' : 40,
                'panel' : 50,
                'testcase' : 60,
                'environment' : 70,
            };
            this.downloadingProgress = progressMap[step];
        },

        /**
         * 取消创建
         */
        actionNewProjectCancel() {
            this.enable = false;
            this.actReject();
        },

        /**
         * 项目下载搜索项目点击
         */
        actionCloneSearchResuleClick(index) {
            this.downloadSelectedProjectIndex = index;
        },
    }
}
</script>
<style scoped>
.clone-search-result {max-height: 400px;overflow-y: auto;}
.clone-search-result-item:hover {background: #f9f9f9;}
</style>