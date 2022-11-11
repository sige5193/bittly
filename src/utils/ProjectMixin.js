import MdbProject from '../models/MdbProject.js'
export default {
    computed : {
        /**
         * 当前项目ID
         * @returns 
         */
        curProjectId() {
            return this.$store.getters.projectActivedId;
        },
    },
    watch : {
        /**
         * 当前项目变更
         */
        curProjectId() {
            this.handleCurProjectIdChanged();
        },
    },
    methods : {
        /**
         * get current project model
         * @returns {MdbProject}
         */
        async getCurProject() {
            return await MdbProject.findOne(this.curProjectId);
        },
        
        /**
         * 处理项目变更
         * @overide
         */
        handleCurProjectIdChanged() {
            // nothing todo here
        }
    },
};