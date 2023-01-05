<template>
  <a-layout class="h-100">
    <a-layout-sider width="300" class="bg-white border-right">
      <div class="d-flex flex-dir-column h-100">
        <div class="border-bottom p-2">
          <a-button @click="actionCreateNew">{{$t('button.create')}}</a-button>
        </div>
        <a-menu 
          ref="envMenu"
          class="flex-grow h-0 overflow-auto" 
          mode="inline" 
          :selectedKeys="[envEditIndex]" 
          @click="actionEnvListMenuItemClicked"
        >
          <a-menu-item v-for="(env, index) in envs" :key="index">{{env.name}}</a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>

    <a-layout>
      <!-- empty -->
      <a-layout-content class="bg-white" v-if="null == editEnv">
        <a-empty class="mt-5" :description="false" />
      </a-layout-content>

      <!-- detail -->
      <a-layout-content v-if="null != editEnv" class="bg-white d-flex flex-dir-column h-100" >
        <!-- header toolbox -->
        <a-row class="p-3 border-bottom">
          <a-col :span="12">
            <a-input
              class="env-edit-name"
              v-model="editEnv.name"
              :placeholder="$t('environment.namePlaceholder')" 
            />
          </a-col>
          <a-col :span="12" class="text-right">
            <a-popconfirm :title="$t('environment.envDeleteConfirmMessage')"
              :ok-text="$t('button.yes')"
              :cancel-text="$t('button.no')"
              @confirm="actionDelete"
            ><a-button>{{$t('button.delete')}}</a-button></a-popconfirm>
            &nbsp;
            <a-button @click="actionCopy">{{$t('button.copy')}}</a-button>
            &nbsp;
            <a-button 
              ref="btnSave" 
              class="env-edit-btn-save"
              :type="hasChanged ? 'primary' : 'default'" 
              @click="actionSave"
            >{{$t('button.save')}}</a-button>
          </a-col>
        </a-row>

        <!-- env content table -->
        <a-table
          class="flex-grow h-0 overflow-auto" 
          :columns="editColumns" 
          :data-source="editEnvValues" 
          :pagination="false"
          size="small"
        >
          <div slot="name" slot-scope="text, record, index">
            <a-input 
              v-model="editEnvValues[index].name" 
              :class="`border-none env-edit-item-name-${index}`" 
              :ref="`inputName_${index}`"
              :placeholder="$t('environment.tableColumnName')" 
              @change="actionEnvItemInputChange(index)"
            />
          </div>
          <div slot="value" slot-scope="text, record, index">
            <a-input 
              v-model="editEnvValues[index].value" 
              :class="`border-none env-edit-item-value-${index}`" 
              :ref="`inputValue_${index}`"
              :placeholder="$t('environment.tableColumnValue')" 
              @change="actionEnvItemInputChange(index)"
            />
          </div>
          <div slot="desc" slot-scope="text, record, index">
            <a-input 
              v-model="editEnvValues[index].desc" 
              :class="`border-none env-edit-item-desc-${index}`" 
              :placeholder="$t('environment.tableColumnDesc')" 
              @change="actionEnvItemInputChange(index)"
            />
          </div>
          <div slot="actions" slot-scope="text, record, index">
            <a-popconfirm 
              placement="topRight"
              :title="$t('environment.itemDeleteConfirm')"
              :ok-text="$t('button.yes')"
              :cancel-text="$t('button.no')"
              @confirm="actionEnvValueDelete(index)"
            >
              <a-button size="small"><a-icon type="delete" /></a-button>
            </a-popconfirm>
          </div>
        </a-table>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import ProjectMixin from '../../utils/ProjectMixin.js'
import MdbEnvironment from '../../models/MdbEnvironment';
export default {
    name : 'ModuleEnvironmentMain',
    mixins : [ProjectMixin],
    data() {
        return {
            /**
             * indicate if edit data changed.
             * @property {Boolean}
             */
            hasChanged : false,
            envs : [],
            envEditIndex : -1,
            editEnv : null,
            editEnvValues : [],
            editColumns : [
                {title: this.$t('environment.tableColumnName'),dataIndex: 'name',key: 'name',scopedSlots: { customRender: 'name' }},
                {title: this.$t('environment.tableColumnValue'),dataIndex: 'value',key: 'value',scopedSlots: { customRender: 'value' }},
                {title: this.$t('environment.tableColumnDesc'),dataIndex: 'desc',key: 'desc',scopedSlots: { customRender: 'desc' }},
                {title: this.$t('environment.tableColumnOperations'),dataIndex: 'actions',key: 'actions',scopedSlots: { customRender: 'actions' }, className:'text-right'},
            ],
        };
    },
    async mounted() {
        this.$store.commit('moduleIdSet', 'environment');
        await this.loadEnvironments();
        let curEnvId = this.$store.getters.envActivedId;
        if ( null != curEnvId ) {
            this.activeEnvById(curEnvId);
        }
    },
    methods : {
        /**
         * event handler on project id changed
         * @see {ProjectMixin.handleCurProjectIdChanged}
         */
        handleCurProjectIdChanged() {
            this.loadEnvironments();
        },

        /**
         * load all environments of current project, if there is no env
         * in this project, a new env would be created.
         */
        async loadEnvironments() {
            this.envs = [];
            this.envEditIndex = -1;
            this.editEnv = null;
            
            let projectId = this.$store.getters.projectActivedId;
            this.envs = await MdbEnvironment.findAll({project_id:projectId});
            if ( 0 == this.envs.length ) {
                await this.actionCreateNew();
            }
        },

        /**
         * create new environment and switch to new env to edit it.
         */
        async actionCreateNew() {
            let newEnv = new MdbEnvironment();
            newEnv.name = this.$t('environment.newEnvDefaultName');
            newEnv.projectId = this.$store.getters.projectActivedId;
            this.envs.push(newEnv);
            this.activeEnv(this.envs.length-1);
        },
        
        /**
         * event handler for env menu item click, it would active the 
         * target env for editing.
         * @param {Event} event
         */
        actionEnvListMenuItemClicked( event ) {
            let key = event.key;
            if ( !this.hasChanged ) {
                this.activeEnv(key);
                return;
            }

            let $this = this;
            this.$confirm({
                title: this.$t('messages.dialogTitle.tip'),
                content: this.$t('environment.envChangeSaveConfirm'),
                okText : this.$t('button.ok'),
                cancelText : this.$t('button.cancel'),
                async onOk() {
                    await $this.actionSave();
                    $this.activeEnv(key);
                },
                onCancel() {
                    $this.hasChanged = false;
                    $this.activeEnv(key);
                },
            });
        },

        /**
         * active env item by given index.
         * @param {Number} index
         */
        activeEnv( index ) {
            if ( undefined == this.envs[index] ) {
                this.envEditIndex = -1;
                this.editEnv = null;
                return;
            }

            this.envEditIndex = index;
            this.editEnv = this.envs[index];
            this.editEnvValues = Object.values(this.editEnv.content);
            this.editEnvValues.push({key:(new Date()).getTime(), name : '',value : '',desc : ''});
        },

        /**
         * delete current env and emit `environment-delete` event
         */
        async actionDelete() {
            let id = this.editEnv.id;
            if ( ! this.editEnv.isNew ) {
                await this.editEnv.delete();
                this.$eventBus.$emit('environment-delete', id);
            }
            await this.loadEnvironments();
        },

        /**
         * save current env and emit `environment-save` event after success.
         */
        async actionSave() {
            let isNewEnv = this.editEnv.isNew;

            let content = {};
            for ( let i=0; i<this.editEnvValues.length; i++ ) {
                if ( '' == this.editEnvValues[i].name.trim().length ) {
                    continue;
                }
                content[this.editEnvValues[i].name] = this.editEnvValues[i];
            }
            this.editEnv.content = content;
            if ( ! await this.editEnv.save() ) {
                this.$message.error(this.$t('environment.envSaveFailed'));
                return;
            }
            
            let envId = this.editEnv.id;
            if ( isNewEnv ) {
                await this.loadEnvironments();
                this.activeEnvById(envId);
            }
            this.$message.success(this.$t('environment.envSaveSuccess'));
            this.$eventBus.$emit('environment-save', envId);
            this.hasChanged = false;
        },

        /**
         * active env by given evn id
         * @param {Number} id
         */
        activeEnvById(id) {
            for ( let i=0; i<this.envs.length; i++ ) {
                if ( this.envs[i].id == id ) {
                    this.activeEnv(i);
                }
            }
        },

        /**
         * copy current env to new env.
         */
        async actionCopy() {
            let data = this.editEnv.getData();
            delete data.id;
            let newEnv = new MdbEnvironment();
            newEnv.setAttributes(data);
            newEnv.name = this.$t('environment.envCopyName',[newEnv.name]);
            await newEnv.save();
            await this.loadEnvironments();
            this.$eventBus.$emit('environment-save', newEnv.id);
            this.activeEnvById(newEnv.id);
        },

        /**
         * delete env item value by given index
         * @param {Number} index
         */
        actionEnvValueDelete(index) {
            this.hasChanged = true;
            this.editEnvValues.splice(index, 1);
            if ( 0 == this.editEnvValues.length ) {
                this.editEnvValues.push({key:(new Date()).getTime(), name : '',value : '',desc : ''});
            }
        },

        /**
         * evnet handler on item editor input
         * @param {Number} index
         */
        actionEnvItemInputChange(index) {
            this.hasChanged = true;
            if ( index == this.editEnvValues.length - 1 ) {
                this.editEnvValues.push({key:(new Date()).getTime(), name : '',value : '',desc : ''});
            }
        },
    },
}
</script>