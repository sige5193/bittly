import Common from '../../utils/Common.js'
import PluginBase from './PluginBase.js';
import PluginExec from './PluginExec.js';
import JSZip, { folder } from 'jszip'
import { v4 as uuidV4 } from 'uuid';
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
     * @returns {Manager}
     */
    static getManager() {
        return Manager.instance;
    }

    /**
     * constructor of plugin manager
     */
    constructor() {
        let userDataPath = window.remote.app.getPath('userData');
        this.basepath = `${userDataPath}/plugins`;
        this.plugins = {};
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
        window.fs.mkdirSync(this.basepath, {recursive:true});
        let pluginsDir = await this.opendir(this.basepath);
        let pluginIds = [];
        for await (const pluginDirent of pluginsDir ) {
            pluginIds.push(pluginDirent.name);
        }
        for ( let i=0; i<pluginIds.length; i++ ) {
            let plugin = await this.loadPluginById(pluginIds[i]);
            if ( false === plugin ) {
                continue;
            }
            await plugin.onLoad();
        }
    }

    /**
     * load plugin by given name
     * @param {String} id 
     */
    async loadPluginById( id ) {
        console.log(`loading plugin : ${id}`);
        let manifest = Common.fileGetContent(`${this.basepath}/${id}/manifest.json`).toString();
        manifest = JSON.parse(manifest);

        let pluginEntryContent = Common.fileGetContent(`${this.basepath}/${id}/index.js`).toString();
        let template = `return ${pluginEntryContent};`;
        let pluginFunc = new Function('BittlyPlugin', template);
        let pluginClass = pluginFunc(PluginBase);
        
        try {
            let plugin = new pluginClass({
                basepath : `${this.basepath}/${id}`
            });
            this.plugins[id] = {manifest:manifest,instance:plugin};
            return plugin;
        } catch ( e ) {
            window.app.$message.warning(window.app.$t('app.plugin.loadFailed',[id, e.message]));
            return false;
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

    /**
     * @param {*} path 
     * @returns 
     */
    rmdir( path ) {
        return new Promise((resolve, reject) => {
            window.fs.rmdir(path, {recursive:true}, ( err ) => {
                if ( err ) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * delete pplugin by id
     * @param {*} id 
     */
    pluginDeleteById( id ) {
        let $this = this;
        return new Promise((resolve, reject) => {
            let plugin = $this.plugins[id].instance;
            let basepath = plugin.getPath();
            plugin.onUninstall().then(() => {
                window.fs.rmdir(basepath, {recursive:true}, ( err ) => {
                    if ( err ) {
                        reject(err);
                    } else {
                        window.remote.app.relaunch();
                        window.remote.app.quit();
                        resolve();
                    }
                });
            }).catch((err) => reject(err));
        });
    }

    /**
     * @param {*} fileData 
     */
    async pluginInstallByFileData( fileData ) {
        let zip = new JSZip();
        await zip.loadAsync(fileData);
        let manifest = zip.file("manifest.json");
        if ( null === manifest ) {
            throw Error(window.app.$t('plugin.installManifestJsonNotExists'));
        }
        
        let id = uuidV4();
        let pluginRoot = `${this.basepath}/${id}`;
        window.fs.mkdirSync(pluginRoot, {recursive:true});
        let folders = zip.filter((relativePath, file) => file.dir);
        for ( let i=0; i<folders.length; i++ ) {
            let folder = folders[i];
            window.fs.mkdirSync(`${pluginRoot}/${folder.name}`,{recursive:true});
        }

        let files = zip.filter((relativePath, file) => !file.dir);
        for ( let i=0; i<files.length; i++ ) {
            let file = files[i];
            let path = `${pluginRoot}/${file.name}`;
            let data = await file.async("arraybuffer");
            data = Buffer.from(data);
            window.fs.writeFileSync(path, data);
        }

        let plugin = null;
        try {
            plugin = await this.loadPluginById(id);
            if ( false === plugin ) {
                throw Error(window.app.$t('plugin.installFailedToLoad'));
            }
            await plugin.onInstall();
        } catch ( e ) {
            await this.rmdir(pluginRoot);
            throw e;
        }
    }
}