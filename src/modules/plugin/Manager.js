import Common from '../../utils/Common.js'
import PluginBase from './PluginBase.js';
import PluginExec from './PluginExec.js';
export default class Manager {
    /**
     * @property {Manager}
     */
    static instance = null;
    
    /**
     * start plugin manager
     */
    static async start () {
        Manager.instance = new Manager();
        await Manager.instance.load();
    }

    /**
     * constructor of plugin manager
     */
    constructor() {
        this.plugins = [];
        window.BittlyPluginExec = (exec) => this.executePluginExec(exec);
    }
    
    /**
     * callback handler to execute plugin action
     * @param {Object} exec 
     */
    executePluginExec( exec ) {
        return PluginExec.execute(exec);
    }

    /**
     * start to load plugins
     */
    async load() {
        let pluginsDir = await this.opendir("D:/Flashin/bittly-dev/plugins");
        let pluginNames = [];
        for await (const pluginDirent of pluginsDir ) {
            pluginNames.push(pluginDirent.name);
        }
        for ( let i=0; i<pluginNames.length; i++ ) {
            await this.loadPluginByName(pluginNames[i]);
        }
    }

    /**
     * load plugin by given name
     * @param {String} name 
     */
    async loadPluginByName( name ) {
        console.log(`loading plugin : ${name}`);
        let pluginEntryContent = Common.fileGetContent(`D:/Flashin/bittly-dev/plugins/${name}/index.js`).toString();
        let template = `return ${pluginEntryContent};`;
        let pluginFunc = new Function('BittlyPlugin', template);
        let pluginClass = pluginFunc(PluginBase);
        
        try {
            let plugin = new pluginClass();
            await plugin.onLoad();
            this.plugins.push(plugin);
        } catch ( e ) {
            window.app.$message.warning(window.app.$t('app.plugin.loadFailed',[name, e.message]));
        }
    }

    /**
     * open dir by given path
     * @param {*} path 
     * @returns {Promise<Dir>}
     */
    opendir( path ) {
        return new Promise(( resolve, reject ) => {
            window.fs.opendir(path, (err, dir) => {
                if ( null == err ) {
                    resolve(dir);
                } else {
                    reject(err);
                }
            });
        });
    }

}