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
import webdriver from 'selenium-webdriver'
export default class Setup {
    /**
     * constructor of testcase setup
     */
    constructor() {
        this.localVue = null;
        this.componentPropsData = {};
        this.componentListeners = {};
        this.storeCommitHandler = function () {};
        this.storeData = {};
        /**
         * @property {webdriver}
         */
        this.webdriver = null;

        /**
         * @property {Object}
         * @public
         */
        this.mockStore = {
            getters : { 
                projectActivedId : null,
                communicators: {},
            },
            commit : (commit, data) => this.storeCommitHandler(commit, data),
            dispatch : (name, data) => this.storeData[name] = data,
        };
        this.mockBittlyApiClient = {
            isGuest : () => true,
            projectVersionList : () => { return {success:true,data:[]}; },
        };
    }

    /**
     * set component prop data
     * @param {*} key 
     * @param {*} value 
     */
    componentSetProp( key, value ) {
        this.componentPropsData[key] = value;
    }
    
    /**
     * set event listener to component
     * @param {*} eventName 
     * @param {*} callback 
     */
    componentOn( eventName, callback ) {
        this.componentListeners[eventName] = callback;
    }

    /**
     * set callback handler on store commit action
     * @param {*} callback 
     */
    onStoreCommit( callback ) {
        this.storeCommitHandler = callback;
    }

    /**
     * setup a test env
     */
    async setup() {
        window.envName = 'test';
        if ( undefined != window.database ) {
            window.database.close();
            window.database = undefined;
        }
        
        window.SerialPort = {};
        window.SerialPort.list = function() {
            return [];
        };

        let sqlite3DB = sqlite3.verbose()
        window.database = new sqlite3DB.Database('');
        await DatabaseSetup.start();
        
        window.app = {};
        window.app.$t = function(key) { return key; }
        window.app.$store = {
            getters : {
                envVariables : {},
            },
            commit : (commit, data) => this.storeCommitHandler(commit, data),
        };
        window.app.$message = {
            warning : function() {},
            success : function() {},
        };
        
        let localVue = createLocalVue();
        localVue.use(Antd);
        localVue.use(VueShortkey);
        localVue.use(VueThermometer)
        localVue.prototype.$appLog = () => {};
        Dictionary.setupVue(localVue);
        BittlyApiClient.setupVue(localVue);
        await Dictionary.load();
        this.localVue = localVue;
    }

    /**
     * set active project id to store
     * @param {String} project 
     */
    async setActiveProject( project ) {
        if ( 'new' === project ) {
            let activeProject = new MdbProject();
            activeProject.name = 'TEMP-PROJECT';
            await activeProject.save();
            this.mockStore.getters.projectActivedId = activeProject.id;
            return activeProject;
        } else {
            this.mockStore.getters.projectActivedId = project.id;
        }
    }

    /** */
    msleep ( time ) {
        return new Promise(( resolve ) => {
            setTimeout(resolve, time);
        });
    }

    /**
     * mount component
     */
    async mount( component, enableShallowMount ) {
        let options = {};
        options.localVue = this.localVue;
        options.propsData = this.componentPropsData;
        options.listeners = this.componentListeners;

        options.i18n = i18n;
        options.mocks = {
            $store : this.mockStore, 
            $bittly : this.mockBittlyApiClient,
            $eventBus : {
                $on : function() {},
                $emit : function() {},
            },
        };

        let wrapper = null;
        if ( true === enableShallowMount ) {
            wrapper = shallowMount(component, options);
        } else {
            wrapper = mount(component, options);
        }
        
        return wrapper;
    }

    /**
     * set radio group value
     * @param {*} wrapper 
     * @param {*} refName 
     * @param {*} value 
     */
    async comRadioGroupSetValue( wrapper, refName, value ) {
        let com = wrapper.findComponent({ref:refName});
        expect(com.exists()).toBeTruthy();

        com.vm.$emit('input',value);
        await com.vm.$nextTick();
        com.vm.$emit('change');
        await com.vm.$nextTick();
    }

    /**
     * change select component value
     * @param {*} wrapper 
     * @param {*} refName 
     * @param {*} value 
     */
    async comSelectChange( wrapper, refName, value ) {
        let select = wrapper.findComponent({ref:refName});
        select.vm.$emit('change',value);
        await select.vm.$nextTick();
    }

    /**
     * change input value
     */
    async comInputChange( wrapper, refName, value, elementName, index ) {
        if ( undefined == elementName ) {
            elementName = 'input';
        }

        let input = null;
        if ( undefined === index ) {
            input = wrapper.findComponent({ref:refName});
        } else {
            input = wrapper.findAllComponents({ref:refName}).at(index);
        }

        input = input.find(elementName);
        await input.setValue(value);
    }

    /**
     * trigger button click
     * @param {*} wrapper 
     * @param {*} refName 
     */
    async comButtonClick( wrapper, refName, index ) {
        let button = null;
        if ( undefined === index ) {
            button = wrapper.findComponent({ref:refName});
        } else {
            button = wrapper.findAllComponents({ref:refName}).at(index);
        }
        await button.trigger('click');
    }

    /**
     * emit event
     * @param {*} wrapper 
     * @param {*} refName 
     * @param {*} eventName 
     * @param {*} data 
     */
    async comTrigger(wrapper, refName, eventName ) {
        let com = wrapper.findComponent({ref:refName});
        await com.trigger(eventName);
    }

    /**
     * emit event
     * @param {*} wrapper 
     * @param {*} refName 
     * @param {*} eventName 
     * @param {*} data 
     */
    async comEmit(wrapper, refName, eventName, data ) {
        let com = wrapper.findComponent({ref:refName});
        com.vm.$emit(eventName,data);
        await com.vm.$nextTick();
    }

    /**
     * get webdriver instance for ui testing
     */
    async setupWebDriver() {
        this.webdriver = await new webdriver.Builder()
        .usingServer('http://localhost:9515')
        .withCapabilities({
            'goog:chromeOptions': {
                binary: 'D:/Flashin/bittly/app/dist_electron/win-unpacked/Bittly.exe'
            }
        })
        .forBrowser('chrome')
        .build();
        await this.webDriverClick('.project');
    }

    /**
     * click element by webdriver
     * @param {String} selector
     * @returns {Promise} 
     */
    async webDriverClick( selector ) {
        let locator = webdriver.By.css(selector);
        await this.webdriver.wait(webdriver.until.elementLocated(locator, 60000));
        await this.webdriver.findElement(locator).click();
    }

    /**
     * send keys to element by webdriver
     * @param {String} selector 
     * @param {String} content 
     */
    async webDriverInput( selector, content ) {
        let locator = webdriver.By.css(selector);
        await this.webdriver.wait(webdriver.until.elementLocated(locator, 60000));
        await this.webdriver.findElement(locator).sendKeys(content);
    }

    /**
     * get if element exists by webdriver
     * @param {String} selector 
     * @returns {Boolean}
     */
    async webDriverElementExists( selector ) {
        let locator = webdriver.By.css(selector);
        let elems = await this.webdriver.findElements(locator);
        return 0 != elems.length
    }

    /**
     * quit webdriver
     */
    async webDriverQuit() {
        await this.webdriver.quit();
    }
}