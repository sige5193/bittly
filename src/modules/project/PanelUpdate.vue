<template>
  <div class="bg-white h-100">
    <a-page-header class="border-bottom mb-4" :title="$t('project.updateHeader')" />
    <div class="pl-3 pr-3 pt-1" v-if="null != project">
      <a-alert banner
        v-if="null == remoteProject" 
        ref="alertRemoteProjectNotExists"
        :message="$t('project.updateNoRemoteProjectInfo')"  
      />
      <a-descriptions v-else :title="$t('project.updateRemoteProjectInfo')">
        <a-descriptions-item :label="$t('project.updateVersionNum')">{{remoteProject.version}}</a-descriptions-item>
        <a-descriptions-item :label="$t('project.updateLastUpdateTime')">{{remoteProject.last_published_at}}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions :title="$t('project.updateLocalProjectInfo')" class="mt-3">
        <a-descriptions-item :label="$t('project.updateVersionNum')">{{project.version}}</a-descriptions-item>
      </a-descriptions>

      <div class="mt-4" v-if="null != remoteProject" >
        <a-button
          ref="btnUpdate"
          type="primary" 
          @click="actionUpdate"
        > {{$t('project.updateButtonUpdate')}} </a-button>
        <div v-if="null != updateProgress"><a-progress :percent="updateProgress" class="w-25"/></div>
      </div>
    </div>
  </div>
</template>
<script>
import MdbDirective from '../../models/MdbDirective.js';
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry.js';
import MdbDirectiveFolder from '../../models/MdbDirectiveFolder.js';
import MdbEnvironment from '../../models/MdbEnvironment.js';
import MdbPanel from '../../models/MdbPanel.js';
import MdbProject from '../../models/MdbProject.js';
import MdbTestcase from '../../models/MdbTestcase.js';
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'ProjectUpdate',
    mixins : [ComponentProjectMixin],
    data() {
        return {
            remoteProject : null,
            updateProgress : null,
        };
    },
    methods : {
        /**
         * event handler on preject reloaded
         * @see {ComponentProjectMixin.onProjectReloaded}
         */
        async onProjectReloaded() {
            if ( '' == this.project.remoteUuid ) {
                return ;
            }
            let response = await this.$bittly.projectGet(this.project.remoteUuid);
            this.remoteProject = response.data;
        },

        /**
         * event handler on button update clicked
         */
        async actionUpdate() {
            this.updateProgress = 0;

            let uuid = this.project.remoteUuid;
            let versionNum = this.remoteProject.version;
            let response = await this.$bittly.projectVersionContentGet(uuid, versionNum);
            if ( !response.success ) {
                this.$message.error(response.message);
                return;
            }

            let content = JSON.parse(response.data.content);
            console.log('update content : ', content);
            
            try {
                await MdbProject.transactionBegin();
                await this.executeUpdate(content);
                await MdbProject.transactionCommit();
            } catch ( e ) {
                await MdbProject.transactionRollback();
                this.$message.error(this.$t('project.updateFailed', [e]));
                this.updateProgress = null;
            }
        },

        /**
         * execute update
         */
        async executeUpdate( content ) {
            let versionNum = this.remoteProject.version;

            // update project
            this.project.setAttributes(content);
            this.project.version = versionNum;
            await this.project.saveOrThrowStringMessage();
            this.updateProgress = 10;

            // update directive
            await MdbDirective.deleteAll({project_id:this.project.id});
            for ( let i=0; i<content.directives.length; i++ ) {
                let directiveData = content.directives[i];
                let directive = new MdbDirective();
                directive.setAttributes(directiveData);
                await directive.saveOrThrowStringMessage();
            }
            this.updateProgress = 20;

            // update directive folder
            await MdbDirectiveFolder.deleteAll({project_id:this.project.id});
            for ( let i=0; i<content.directiveFolders.length; i++ ) {
                let itemData = content.directiveFolders[i];
                let item = new MdbDirectiveFolder();
                item.setAttributes(itemData);
                await item.saveOrThrowStringMessage();
            }
            this.updateProgress = 30;

            // update directive entry
            await MdbDirectiveEntry.deleteAll({project_id : this.project.id});
            for ( let i=0; i<content.directiveEntries.length; i++ ) {
                let itemData = content.directiveEntries[i];
                let item = new MdbDirectiveEntry();
                item.setAttributes(itemData);
                await item.saveOrThrowStringMessage();
            }
            this.updateProgress = 40;

            // update panels
            await MdbPanel.deleteAll({project_id : this.project.id});
            for ( let i=0; i<content.panels.length; i++ ) {
                let itemData = content.panels[i];
                let item = new MdbPanel();
                item.setAttributes(itemData);
                await item.saveOrThrowStringMessage();
            }
            this.updateProgress = 50;
            
            // update testcase
            await MdbTestcase.deleteAll({project_id : this.project.id});
            for ( let i=0; i<content.testcases.length; i++ ) {
                let itemData = content.testcases[i];
                let item = new MdbTestcase();
                item.setAttributes(itemData);
                await item.saveOrThrowStringMessage();
            }
            this.updateProgress = 60;

            // update env
            await MdbEnvironment.deleteAll({project_id : this.project.id});
            for ( let i=0; i<content.envs.length; i++ ) {
                let itemData = content.envs[i];
                let item = new MdbEnvironment();
                item.setAttributes(itemData);
                await item.saveOrThrowStringMessage();
            }
            this.updateProgress = 70;

            // done
            this.updateProgress = 100;

            // emit update event
            this.$eventBus.$emit('project-current-update');
            this.$message.success(this.$t('project.updateSuccess'));
        },
    },
}
</script>