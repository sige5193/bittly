import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
/**
 * @example 
 * await window.remote.webContents.fromId(1)
 * .executeJavaScript('BittlyPluginExec({action:"RuntimeVariableGet",name:"app_client_id",default:"x"})')
 */
export default class PluginExec {
    /**
     * execute plugin action
     * @param {*} exec 
     * @returns 
     */
    static execute( exec ) {
        return new Promise(( resolve, reject ) => {
            if ( 'object' != typeof(exec) || undefined === exec.action ) {
                reject(`unable to execute plugin action.`);
                return;
            }

            let executor = new PluginExec();
            let action = `action${exec.action}`;
            if ( undefined === executor[action] ) {
                reject(`plugin action "${exec.action}" is not available.`);
                return;
            }

            executor[action](exec)
            .then((retVal) => resolve(retVal))
            .catch((err) => reject(err));
        });
    }

    /**
     * get runtime variable by given name
     * @param {Object} exec 
     * @returns 
     */
    async actionRuntimeVariableGet(exec) {
        let value = await MdbRuntimeVariable.getVarValue(exec.name, exec.default);
        return value;
    }

    /**
     * set runtime varibale.
     * @param {*} exec 
     * @returns 
     */
    async actionRuntimeVariableSet( exec ) {
        await MdbRuntimeVariable.setVarValue(exec.name, exec.value);
        return true;
    }
}