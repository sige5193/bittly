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
        /**
         * id of current module
         * @property {String}
         */
        moduleId : null,
        /**
         * list of mock service handlers
         * @property {Object<String:Object>}
         */
        mocks : {},
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

        /**
         * get current module id
         * @param {*} state 
         * @returns {String}
         */
        moduleId( state ) {
            return state.moduleId; 
        }

        /**
         * get mock services
         * @param {*} state 
         * @returns 
         */
        mocks( state ) {
            return state.mocks;
        }
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
         * mock service start
         * @param {*} state 
         * @param {*} item 
         */
        mockStart( state, item ) {
            state.mocks[item.key] = item;
            window.app.$eventBus.$emit('mock-start', item);
        },

        /**
         * mock service stop
         * @param {*} state 
         * @param {*} key 
         */
        mockStop( state, key ) {
            delete state.mocks[key];
            window.app.$eventBus.$emit('mock-stop', key);
        },

        /**
         * 环境变量设置
         * @param {*} state 
         * @param {*} variables 
         */
        envVariablesSet( state, variables ) {
            state.envVariables = variables;
        },
        
        /**
         * set current module id
         * @param {*} state 
         * @param {*} id 
         */
        moduleIdSet( state, id ) {
            state.moduleId = id;
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
         * @param {String|null} id 
         */
        async envActivedIdSet(context, id) {
            let content = {};
            if ( null !== id ) {
                let env = await MdbEnvironment.findOne(id);
                if ( null === env ) {
                    console.trace(`Unable to find environment by given id ${id}`);
                    throw Error(`Unable to find environment by given id ${id}`);
                }
                content = env.content;
            }
            
            context.commit('envVariablesSet', content);
            context.commit('envActivedIdSet', id);
        },

        /**
         * close all communicators
         * @param {*} context 
         */
        async closeAllCommunicators ( context ) {
            let coms = context.getters.communicators;
            for ( let comKey in coms ) {
                await coms[comKey].close();
            }
        }
    },
})
