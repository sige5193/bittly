import MdbRuntimeVariable from '../models/MdbRuntimeVariable.js'
import Environment from "../environments/Environment.js";
export default class AppHelper {
    /**
     * get application language code
     * @returns {String}
     */
    static async langCodeGet() {
        let lang = null;
        let env = Environment.getEnv();
        let countryLangMap = {CN:'zh'};
        let countryCode = await env.langCodeGet();
        lang = countryLangMap[countryCode] || 'zh';
        return lang;
    }
}