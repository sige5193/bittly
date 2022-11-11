<template>
  <div class="bg-white h-100">
    <a-page-header class="border-bottom mb-4" :title="$t('project.publishLabel')" />
    <div class="p-3" v-if="null != project">
      <a-textarea
        v-model="comment"
        :placeholder="$t('project.publishComment')"
        :auto-size="{ minRows: 3, maxRows: 5 }"
      />

      <div class="mt-3" v-if="publishToSource" ref="targetTip">
        <strong>{{$t('project.publishTarget')}} : </strong>
        <span>{{$t('project.publishTargetSourceProject')}}</span>
      </div>

      <div class="mt-4" v-if="publishToSource">
        <a-button ref="btnPublishToNewProject" 
          @click="actionPublish"
        >{{$t('project.publishToNewProject')}}</a-button>
        &nbsp;
        <a-button type="primary" 
          @click="actionPublish"
        >{{$t('project.publishToSourceProject')}}</a-button>
      </div>
      <div class="mt-4" v-else>
        <a-button type="primary" @click="actionPublish">{{$t('project.publishButton')}}</a-button>
      </div>
      
      <div class="mt-3 log-viewer">
        <a-list size="small" bordered :data-source="versions">
          <div slot="header">{{$t('project.publishLog')}}</div>
          <a-list-item slot="renderItem" slot-scope="item">
            <strong>ver {{ item.num }}</strong> <small>{{item.created_at}} </small> <br>
            {{item.comment}}
          </a-list-item>
        </a-list>
      </div>
    </div>
  </div>
</template>
<script>
import ComponentProjectMixin from '../../utils/ComponentProjectMixin.js'
export default {
    name : 'PanelPublish',
    mixins : [ComponentProjectMixin],
    data() {
        return {
            comment : '',
            publishToSource : false,
            versions : [],
        };
    },
    methods : {
        /**
         * event handle on project reload
         * @see {ComponentProjectMixin.onProjectReloaded}
         * @returns 
         */
        async onProjectReloaded() {
            this.comment = '';
            if ( '' == this.project.remoteUuid ) {
                this.publishToSource = false;
            } else if ( this.project.sourceUuid == this.project.remoteUuid ) {
                return this.publishToSource = true;
            } else {
                this.publishToSource = false;
            }
            
            this.versions = [];
            if ( '' != this.project.remoteUuid ) {
                let versionsResponse = await this.$bittly.projectVersionList(this.project.remoteUuid);
                if ( !versionsResponse.success ) {
                    this.$message.error(versionsResponse.message);
                    return;
                }
                if ( null === versionsResponse.data ) {
                    versionsResponse.data = [];
                }
                this.versions = versionsResponse.data;
            }
        },
        
        /**
         * publish to new project, it would create a new project first
         * and then push to that new project.
         */
        async actionPublish() {
            if ( !this.loginRequiredCheck() ) {
                return;
            }

            if ( 0 == this.comment.trim().length ) {
                this.$message.error(this.$t('project.publishCommentEmpty'));
                return;
            }

            if ( '' == this.project.remoteUuid ) {
                let createResponse = await this.$bittly.projectCreate();
                if ( !createResponse.success ) {
                    this.$message.error(this.$t('project.publishCreateFailed', [createResponse.message]));
                    return;
                }

                this.project.remoteUuid = createResponse.data.uuid;
                await this.project.save();
            }

            let publish = {};
            publish.uuid = this.project.remoteUuid;
            publish.comment = this.comment;
            publish.content = await this.project.generatePublishData();
            let publishResponse = await this.$bittly.projectPublish(publish);
            if ( !publishResponse.success ) {
                this.$message.error(this.$t('project.publishFailed', [publishResponse.message]));
                return;
            }

            this.project.version = publishResponse.data.version;
            await this.project.save();
            this.$message.success(this.$t('project.publishSuccess'));
            await this.onProjectReloaded();
        },
    },
}
</script>
<style scoped>
.log-viewer {height:400px;overflow-y: auto;}
</style>