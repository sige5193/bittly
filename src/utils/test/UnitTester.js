import Vue from 'vue'
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
         * mock bittly api client
         * @property {Object}
         */
        this.mockBittlyApiClient = options.mockBittlyApiClient || {};
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
     * setup a test env
     */
    async setup() {
        window.envName = 'test';
        
        // clean database
        if ( undefined != window.database ) {
            window.database.close();
            window.database = undefined;
        }
        let sqlite3DB = sqlite3.verbose()
        window.database = new sqlite3DB.Database('');
        await DatabaseSetup.start();

        // setup localvue
        let localVue = createLocalVue();
        localVue.use(Antd);
        localVue.use(VueShortkey);
        localVue.use(VueThermometer)
        localVue.prototype.$appLog = () => {};
        Dictionary.setupVue(localVue);
        BittlyApiClient.setupVue(localVue);
        await Dictionary.load();
        this.localVue = localVue;
        this.mount({template:'<div></div>'});
    }

    /**
     * mount component
     * @param {OBject} component
     * @param {Boolean} enableShallowMount
     */
    async mount( component, enableShallowMount=false ) {
        let options = {};
        options.localVue = this.localVue;
        options.provide = this.componentMountProvide;
        options.propsData = this.componentMountPropsData;
        options.stubs = this.componentMountStubs; 
        options.listeners = this.componentMountListeners;
        options.i18n = i18n;
        options.mocks = this.componentMountMocks;
        options.mocks.$bittly = this.mockBittlyApiClient;
        options.mocks.$eventBus = this.eventBus;
        options.mocks.$store = {};
        options.mocks.$store.commit = (commit, data) => this.storeCommitHandler(commit, data);
        options.mocks.$store.dispatch = (name, data) => this.storeData[name] = data;
        options.mocks.$store.getters = this.mockStoreGetters;
        if ( undefined == options.mocks.$store.getters.communicators ) {
            options.mocks.$store.getters.communicators = {};
        }

        if ( null != this.project ) {
            options.mocks.$store.getters.projectActivedId = this.project.id;
        }

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
     * @param {*} commit 
     * @param {*} data 
     */
    storeCommitHandler( commit, data ) {
        if ( undefined == this.mockStoreCommits[commit] ) {
            return;
        }
        this.mockStoreCommits[commit](data);
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
     * get element text by given selector
     * @param {*} selector 
     * @param {*} wrapper 
     * @returns {String}
     */
    async click( selector, wrapper=null, index=0 ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        if ( 'object' === typeof(selector) ) {
            let com = wrapper.findAllComponents(selector).at(index);
            await com.vm.$emit('click');
        } else {
            let elem = wrapper.findAll(selector).at(index);
            await elem.trigger('click');
        }
        await this.msleep(200);
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
     * change input value
     */
    async input( selector, value, wrapper=null, index=0 ) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }
        
        if ( 'object' === typeof(selector) ) {
            let com = wrapper.findAllComponents(selector).at(index);
            let input = com.find('input');
            await input.setValue(value);
        }
        await this.msleep(200);
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
        if ( 'object' === typeof(selector) ) {
            let coms = wrapper.findAllComponents(selector);
            await coms.at(index).vm.$emit(eventName, ... data);
        }
        await this.msleep(200);
    }

    /**
     * trigger event
     * @param {*} selector 
     * @param {*} eventName 
     * @param {*} wrapper 
     */
    async trigger( selector, eventName, data=[], wrapper=null, index=-1) {
        if ( null === wrapper ) {
            wrapper = this.wrapper;
        }

        let com = null;
        if ( -1 === index ) {
            com = wrapper.findComponent(selector);
        } else {
            com = wrapper.findAllComponents(selector).at(index);
        }
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
        return activeProject;
    }

    /**
     * active project
     * @param {*} project 
     */
    activeProject( project ) {
        this.project = project;
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
}