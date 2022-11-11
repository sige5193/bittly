import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n);
export default new VueI18n({
    locale: 'en',
    messages: {
        /**
         * translation for Simplified Chinese 
         * @property {Object}
         */
        zh: require('./zh.lang.js'),
        /**
         * translation for English
         * @property {Object}
         */
        en: require('./en.lang.js'),
    }
});