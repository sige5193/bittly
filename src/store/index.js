import Vue from 'vue'
import Vuex from 'vuex'
import MdbEnvironment from '../models/MdbEnvironment.js'
import MdbRuntimeVariable from '../models/MdbRuntimeVariable.js'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        /** 当前项目ID */
        projectActivedId : null,
        /** 当前环境ID */
        envActivedId : null,
        /** 环境变量列表 */
        envVariables : {},
        /** 通讯器列表 */
        communicators : {},
    },
    getters : {
        /**
         * 获取当前活跃项目ID
         * @param {*} state 
         * @returns 
         */
        projectActivedId( state ) {
            return state.projectActivedId;
        },

        /**
         * 获取当前环境ID
         * @param {*} state 
         * @returns 
         */
        envActivedId( state ) {
            return state.envActivedId;
        },

        /**
         * 获取通讯器列表
         * @param {*} state 
         * @returns 
         */
        communicators( state ) {
            return state.communicators;
        },

        /**
         * 获取环境变量
         * @param {*} state 
         * @returns 
         */
        envVariables( state ) {
            return state.envVariables;
        },
    },
    mutations: {
        /** 
         * 设置当前活跃项目ID
         */
        projectActivedIdSet( state, id ) {
            state.projectActivedId = id;
        },

        /**
         * 设置当前环境ID
         * @param {*} state 
         * @param {*} id 
         */
        envActivedIdSet( state, id ) {
            state.envActivedId = id;
        },

        /**
         * 通讯器上线
         * @param {*} state 
         * @param {*} key 
         * @param {*} communicator 
         */
        communicatorOnline( state, item ) {
            state.communicators[item.key] = item.com;
            window.app.$eventBus.$emit('communicator-online', item.key);
        },

        /**
         * 通讯器下线
         * @param {*} state 
         * @param {*} key 
         */
        communicatorOffline( state, key ) {
            delete state.communicators[key];
            window.app.$eventBus.$emit('communicator-offline', key);
        },

        /**
         * 环境变量设置
         * @param {*} state 
         * @param {*} variables 
         */
        envVariablesSet( state, variables ) {
            state.envVariables = variables;
        }
    },
    actions: {
        /**
         * 设置当前活跃项目ID
         */
        async projectActivedIdSet( context, id ) {
            let runtimeVariable = await MdbRuntimeVariable.findOne({key:'project_actived_id'});
            if ( null == runtimeVariable ) {
                runtimeVariable = new MdbRuntimeVariable();
                runtimeVariable.key = 'project_actived_id';
            }
            runtimeVariable.value = id;
            await runtimeVariable.save();
            context.commit('projectActivedIdSet', id);
        },

        /**
         * 设置当前活跃环境变量ID
         * @param {*} context 
         * @param {*} id 
         */
        async envActivedIdSet(context, id) {
            let env = await MdbEnvironment.findOne(id);
            context.commit('envVariablesSet', env.content);
            context.commit('envActivedIdSet', id);
        },
    },
})
