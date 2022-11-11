<template>
  <div class="list-container">
    <div v-for="(project, index) in projects" :key="index" class="project">
      <div class="content" @click="actionProjectClicked(index)">
        <div class="name">{{project.name}}</div>
        <div class="desc">{{project.description}}&nbsp;</div>
      </div>
    </div>
    <div class="project-create">
      <div class="content" @click="actionCreateProject"> {{$t('button.create')}} </div>
    </div>
    <modal-project-create ref="modalCreate"></modal-project-create>
  </div>
</template>
<script>
import ModalProjectCreate from './ModalProjectCreate.vue'
import MdbProject from '../../models/MdbProject.js'
export default {
    name : 'PageProjectIndex',
    components : {
        'modal-project-create' : ModalProjectCreate,
    },
    data() {
        return {
            projects : [],
        };
    },
    async mounted() {
        await this.refreshProjects();
    },
    methods : {
        /**
         * 刷新项目列表
         */
        async refreshProjects() {
            this.projects = [];
            this.projects = await MdbProject.findAll();
        },

        /**
         * 项目被点击
         */
        actionProjectClicked(index) {
            this.$store.dispatch('projectActivedIdSet', this.projects[index].id);
        },

        /**
         * 创建项目
         */
        async actionCreateProject() {
            try {
                let project = await this.$refs.modalCreate.open();
                this.$store.dispatch('projectActivedIdSet', project.id);
            } catch {}
        },
    }
}
</script>
<style scoped>
.list-container {display: flex;flex-wrap: wrap;flex-direction: row;align-content: center;justify-content: center;align-items: flex-start;padding: 100px;height: 100%;user-select: none;}
.project:hover {background: #f9f9f9;}
.project {width: 20%;padding: 5px;}
.project > .content > .name {color: #818181;font-size: 1.2em;overflow: hidden;text-overflow: ellipsis;word-break: keep-all;}
.project > .content > .desc {color: #d7d7d7;font-size: 0.9em;height: 1.5em;overflow: hidden;text-overflow: ellipsis;word-break: keep-all;}
.project > .content {border: solid 1px #d7d7d7;border-radius: 5px;padding: 10px;}
.project-create {width: 20%;padding: 5px;}
.project-create:hover {background: #f9f9f9;}
.project-create > .content {border: solid 1px #e1e1e1;padding: 10px;border-radius: 5px;text-align: center;line-height: 3.1em;cursor: default;}
</style>