export default class BittlyMainClient {
    /**
     * call main process handler
     * @param {String} name 
     * @param {Object} params 
     * @returns 
     */
    static async call( name, params ) {
        let response = await window.ipcRenderer.invoke('main-controll-request', {
            action : name,
            params : params,
        });
        return response;
    }

    /**
     * get system country code
     * @returns {String}
     */
    static async systemLocaleCountryCodeGet() {
        return await BittlyMainClient.call('system/locale-country-code-get');
    }
}