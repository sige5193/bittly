import BittlyMainClient from "./BittlyMainClient";
import MdbRuntimeVariable from '../models/MdbRuntimeVariable.js'
export default class AppHelper {
    /**
     * get application language code
     * @returns {String}
     */
    static async langCodeGet() {
        let lang = await MdbRuntimeVariable.getVarValue('app_language', null);
        if ( null == lang ) {
            let countryLangMap = {CN:'zh'};
            let countryCode = await BittlyMainClient.systemLocaleCountryCodeGet();
            lang = countryLangMap[countryCode] || 'zh';
        }
        return lang;
    }
}