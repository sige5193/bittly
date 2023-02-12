import Vue from 'vue'
import Vuex from 'vuex'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Antd from 'ant-design-vue';
import i18n from '@/i18n/index.js'
import Dictionary from '@/utils/Dictionary';
import sqlite3 from 'sqlite3';
import DatabaseSetup from '@/utils/database/Setup.js'
import VueShortkey from 'vue-shortkey'
import VueThermometer from 'vuejs-thermometer'
import BittlyApiClient from '@/utils/BittlyApiClient.js'
import MdbProject from '../../models/MdbProject.js'
import Environment from '../../environments/Environment.js';
import EnvElectron from '../../environments/EnvElectron.js';
import Store from '../../store/index.js'
import MockStore from './MockStore.js';
import MyObject from '../datatype/MyObject.js';
import StorageSqlite from '../database/StorageSqlite.js';
export default class UnitTester {
    /**
     * constructor of testcase setup
     * @param {Object} options options to config tester
     * - mockBittlyApiClient : {callName : callhandler}
     * - listeners : {object<eventName:callback>} 
     * - mockStoreGetters : {object}
     */
    constructor( options={} ) {
        /**
         * the wrapper instance of component
         * @property {VueWrapper}
         */
        this.wrapper = null;
        /**
         * vue instance for testing
         * @property {VueComponent}
         */
        this.localVue = null;
        /**
         * mocked store instance
         * @property {Object}
         */
        this.store = require('../../store/index').default;





        /**
         * mock bittly api client
         * @property {Object}
         */
        this.mockBittlyApiClient = options.mockBittlyApiClient || {start:()=>{},isGuest:()=>true};
        /**
         * mock getters of store
         * @property {Object}
         */
        this.mockStoreGetters = options.mockStoreGetters || {};
        /**
         * mock commits of store
         * @property {Object}
         */
        this.mockStoreCommits = options.mockStoreCommits || {};
        /**
         * provides for components
         * @property {Object}
         */
        this.componentMountProvide = options.provide || {};
        /**
         * props for components
         * @property {Object}
         */
        this.componentMountPropsData = options.props || {};
        /**
         * stubs for components
         * @property {Object|Array}
         */
        this.componentMountStubs = options.stubs || [];
        /**
         * listeners for components
         * @property {Object}
         */
        this.componentMountListeners = options.listeners || {};
        /**
         * mocks for components
         * @property {Object}
         */
        this.componentMountMocks = options.mocks || {};
        /**
         * instance of vue to hold eventbus
         * @property {Vue}
         */
        this.eventBus = new Vue();
        /**
         * instance of project
         * @property {MdbProject|null}
         */
        this.project = null;
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        

        this.storeData = {};
    }

    /**
     * listen event on component
     * @param {*} eventName 
     * @param {*} handler 
     */
    on( eventName, handler ) {
        this.componentMountListeners[eventName] = handler;
    }

    /**
     * set prop value to componement
     * @param {*} name 
     * @param {*} value 
     */
    prop( name, value ) {
        this.componentMountPropsData[name] = value;
    }

    /**
     * setup a test env
     */
    async setup( envName='Electron' ) {
        // window.console.log = () => {};
        window.envName = 'test';
        this.setupEnvironment(envName);
        Environment.switchEnv(envName);
        
        let sqlite3DB = sqlite3.verbose()
        let database = new sqlite3DB.Database('');
        StorageSqlite.setDatabase(database);
        await DatabaseSetup.start();

        // setup localvue
        let localVue = createLocalVue();
        localVue.prototype.$env = Environment.getEnv();
        localVue.prototype.$log = () => {};

        localVue.use(Vuex);
        localVue.use(Antd);
        localVue.use(VueShortkey);
        localVue.use(VueThermometer)
        localVue.prototype.$appLog = () => {};
        Dictionary.setupVue(localVue);
        BittlyApiClient.setupVue(localVue);
        await Dictionary.load();
        this.localVue = localVue;
        await this.mount({template:'<div></div>'});
    }

    /**
     * setup basic env variables
     * @param {*} name 
     */
    setupEnvironment( name ) {
        if ( 'Electron' === name ) {
            window.remote = {
                process : {
                    env : {NODE_ENV:'test'}
                },
                app : {
                    getPath : () => './',
                },
            };
            window.ipcRenderer = {
                on : () => {},
                invoke : () => null,
                send(){},
            };
            window.shell = {
                openExternal(){}
            };
            window.fs = {
                mkdirSync(){},
                opendir(path,callback){callback(null,[])},
            };
            window.os = {
                platform() { return 'win32'; },
                arch() { return 'x86'; }
            };
        }
    }

    /**
     * mount component
     * @param {OBject} component
     * @param {Boolean} enableShallowMount
     */
    async mount( component, enableShallowMount=false ) {
        let options = {};
        options.localVue = this.localVue;
        options.store = new Vuex.Store(Store);
        options.provide = this.componentMountProvide;
        options.propsData = this.componentMountPropsData;
        options.stubs = this.componentMountStubs; 
        options.listeners = this.componentMountListeners;
        options.i18n = i18n;
        options.mocks = this.componentMountMocks;
        options.mocks.$bittly = this.mockBittlyApiClient;
        options.mocks.$eventBus = this.eventBus;
        this.wrapper = null;
        if ( true === enableShallowMount ) {
            this.wrapper = shallowMount(component, options);
        } else {
            this.wrapper = mount(component, options);
        }

        window.app = this.wrapper.vm;
        await this.msleep(200);
        return this.wrapper;
    }

    /**
     * get value of component data.
     * @param {String} name 
     * @returns {any}
     */
    dataGet(name) {
        return this.wrapper.vm.$data[name];
    }

    /**
     * check if element exists by given selector
     * @param {*} selector 
     * @param {*} wrapper 
     * @returns {Boolean}
     */
    exists( selector, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        if ( 'object' === typeof(selector) ) {
            return wrapper.findComponent(selector).exists();
        } else {
            return wrapper.find(selector).exists();
        }
    }

    /**
     * get element text by given selector
     * @param {*} selector 
     * @param {*} wrapper 
     * @returns {String}
     */
    text( selector, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        if ( 'object' === typeof(selector) ) {
            return wrapper.findComponent(selector).text();
        } else {
            return wrapper.find(selector).text();
        }
    }

    

    /**
     * set text value to textarea
     * @param {*} selector 
     * @param {*} value 
     * @param {*} wrapper 
     */
    async textareaInput( selector, value, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        
        if ( 'object' === typeof(selector) ) {
            let com = wrapper.findComponent(selector);
            let textarea = com.find('textarea');
            await textarea.setValue(value);
        }
    }

    /**
     * emit event by given name
     * @param {*} selector 
     * @param {*} eventName 
     * @param {Array<any>} data 
     * @param {*} wrapper 
     */
    async emit( selector, eventName, data=[], wrapper=null, index=0) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        let com = this.getTargetBySelector(wrapper, selector);
        await com.vm.$emit(eventName, ... data);
        await this.msleep(200);
    }

    /**
     * trigger event
     * @param {Object} selector 
     * @param {*} eventName 
     * @param {*} wrapper 
     */
    async trigger( selector, eventName, data=[], wrapper=null) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }

        let com = this.getTargetBySelector(wrapper, selector);
        await com.trigger(eventName, ... data);
        await this.msleep(200);
    }

    /**
     * delay by give time
     * @param {Number} time
     */
    msleep ( time ) {
        return new Promise(( resolve ) => {
            setTimeout(resolve, time);
        });
    }

    /**
     * emit event by on event bus
     * @param {String} name 
     */
    async eventBusEmit( name, ... data ) {
        await this.wrapper.vm.$eventBus.$emit(name, ... data);
    }

    /**
     * register eventbus event handler
     * @param {*} name 
     * @param {*} callback 
     */
    eventBusOn( name, callback ) {
        this.eventBus.$on(name, callback);
    }

    /**
     * count elements
     * @param {String|Object} selector 
     * @param {*} wrapper 
     * @returns 
     */
    count( selector, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        if ( 'object' === typeof(selector) ) {
            return wrapper.findAllComponents(selector).length;
        } else {
            return wrapper.findAll(selector).length;
        }
    }

    /**
     * change select component value
     * @param {*} wrapper 
     * @param {*} refName 
     * @param {*} value 
     */
    async select ( selector, value, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        if ( 'object' === typeof(selector) ) {
            let select = wrapper.findComponent(selector);
            select.vm.$emit('change',value);
            await select.vm.$nextTick();
        }
        await this.msleep(200);
    }

    /**
     * set active project id to store
     * @param {String} project 
     */
    async activeNewProject() {
        let activeProject = new MdbProject();
        activeProject.name = 'TEMP-PROJECT';
        await activeProject.save();
        this.project = activeProject;
        this.store.state.projectActivedId = activeProject.id;
        return activeProject;
    }

    /**
     * active project
     * @param {*} project 
     */
    activeProject( project ) {
        this.project = project;
        this.store.state.projectActivedId = project.id;
    }

    /**
     * dispatchEvent
     * @param {*} selector 
     * @param {*} event 
     * @param {*} wrapper 
     */
    async dispatchEvent(selector, event, wrapper=null) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }

        let elem = wrapper.find(selector);
        elem.element.dispatchEvent(event);
        await wrapper.vm.$nextTick();
    }

    /**
     * expect error
     * @param {*} fn 
     * @param {*} error 
     */
    async expectError(fn, error) {
        let errorHandler = jest.fn(() => {});
        try {
            await fn();
        } catch ( e ) {
            errorHandler(e);
        }
        if ( 0 === errorHandler.mock.calls.length ) {
            debugger
        }
        let throwError = errorHandler.mock.calls[0][0];
        let message = 'string' == typeof(throwError) ? throwError : throwError.message; 
        expect(message).toBe(error);
    }

    /**
     * @param {*} selector 
     * @param {*} value 
     * @param {*} wrapper 
     */
    async radioGroupSelect( selector, value, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        let select = wrapper.findComponent(selector);
        select.vm.$emit('input', value);
        select.vm.$emit('change');
        await select.vm.$nextTick();
        await this.msleep(200);
    }
    





    
    /**
     * @param {*} selector 
     * @param {*} key 
     * @param {*} wrapper 
     */
    async dropdownMenuClick(triggerSelector, menuSelector, data, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }

        if ( 'string' === typeof(data) ) {
            data = {key:data};
        }
        await this.trigger(triggerSelector, 'click');
        await this.emit(menuSelector, 'click', [data]);
    }

    /**
     * get target by given selector
     * @param {*} wrapper 
     * @param {Object} selector selector of target
     * - {ref:'elem-name'}
     * - {ref:'elem-name',index:1}
     * @returns 
     */
    getTargetBySelector( wrapper, selector ) {
        let selectorName = JSON.stringify(selector);
        let querySelector = selector;
        if ( 'object' === typeof(selector) ) {
            querySelector = {};
            if ( undefined != selector.ref ) {
                querySelector.ref = selector.ref;
            }
        }

        let index = 0;
        if ( 'object' === typeof(selector) && undefined !== selector.index ) {
            index = selector.index;
        }

        let target = null;
        if ( 0 == index ) {
            target = wrapper.findComponent(querySelector);
        } else {
            let list = wrapper.findAllComponents(querySelector);
            if ( 0 === list.length ) {
                throw Error(`unable to locate target by given selector : ${selectorName}`);
            }
            
            target = list.at(index);
        }

        if ( !target.exists() ) {
            throw Error(`target does not exists by given selector : ${selectorName}`);
        }

        return target;
    }

    /**
     * click element by given selector
     * @param {*} selector 
     * @param {*} wrapper 
     */
    async click( selector, wrapper=null ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        let com = this.getTargetBySelector(wrapper, selector);
        if ( undefined === com.vm ) {
            await com.trigger('click');
        } else {
            await com.vm.$emit('click');
        }
        await this.msleep(200);
    }

    /**
     * change input value
     */
    async input( selector, value, wrapper=null) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        let input = this.getTargetBySelector(wrapper, selector);
        if ( undefined !== input.vm ) {
            input = input.find(selector.input || 'input');
        }
        await input.setValue(value);
        await this.msleep(200);
    }

    /**
     * execute dispatch to current store
     * @param {*} action 
     * @param {*} payload 
     */
    async storeDispatch( action, payload ) {
        await this.wrapper.vm.$store.dispatch(action, payload);
    }
}