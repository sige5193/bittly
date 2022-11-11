import MdbProject from '../models/MdbProject.js'
export default {
    data() {
        return {
            project : null,
        };
    },
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
            this.loadProject();
        },
    },
    async mounted() {
        await this.loadProject();
        await this.init();
    },
    methods : {
        /**
         * 加载项目
         */
        async loadProject() {
            this.project = null;
            let id = this.curProjectId;
            if ( null == id ) {
                return;
            }
            this.project = await MdbProject.findOne(id);
            await this.onProjectReloaded();
        },

        /**
         * 项目重新加载事件
         * @returns 
         */
        onProjectReloaded() {
            return new Promise(function( resolve ) {
                resolve();
            });
        },
        
        /**
         * 初始化
         * @returns 
         */
        init() {
            return new Promise(function( resolve ) {
                resolve();
            });
        },
        
        /**
         * 用户登录检查
         */
        loginRequiredCheck() {
            if ( this.$bittly.isGuest() ) {
                window.app.$eventBus.$emit('user-login-required');
                this.$message.error('请登录后再继续操作');
                return false;
            }
            return true;
        }
    },
}