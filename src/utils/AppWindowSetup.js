import Environment from '../environments/Environment.js';
import Vue from 'vue'
import VueShortkey from 'vue-shortkey'
import Antd from 'ant-design-vue';
import VueCodeMirror from 'vue-codemirror'
import Dictionary from './Dictionary.js';
import store from '../store/index.js'
import i18n from '../i18n/index.js'
import 'ant-design-vue/dist/antd.css';
import 'codemirror/lib/codemirror.css'
export default class AppWindowSetup {
    /**
     * 初始化
     * @param {*} component 
     */
    static setup( component ) {
        Vue.prototype.$eventBus = new Vue();
        Vue.config.productionTip = false

        Vue.use(VueShortkey)
        Vue.use(Antd);
        Vue.use(VueCodeMirror);

        let env = Environment.setup();
        Vue.prototype.$env = env;

        Dictionary.setupVue(Vue);
        window.app = new Vue({
            store,
            i18n,
            render: h => h(component),
        });
        window.app.$mount('#app');
    }
}