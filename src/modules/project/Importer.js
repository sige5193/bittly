import PackageJSON from '../../../package.json'
import JSZip from 'jszip';
import MdbDirective from '../../models/MdbDirective';
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry';
import MdbDirectiveFolder from '../../models/MdbDirectiveFolder';
import MdbEnvironment from '../../models/MdbEnvironment';
import MdbFunctionalTestcase from '../../models/MdbFunctionalTestcase';
import MdbMock from '../../models/MdbMock';
import MdbPanel from '../../models/MdbPanel';
import MdbProject from '../../models/MdbProject';
import MdbTestcase from '../../models/MdbTestcase';
export default class Importer {
    /**
     * @param {*} filepath 
     */
    constructor( filepath ) {
        this.filepath = filepath;
    }

    /**
     * execute 
     */
    async execute() {
        let content = await this.loadFileContent();
        let zip = new JSZip();
        await zip.loadAsync(content);
        let dataJson = zip.file('data.json');
        if ( null === dataJson ) {
            throw Error(window.app.$t('project.importFileInvalid'));
        }

        dataJson = await dataJson.async('text');
        let data = JSON.parse(dataJson);
        
        if ( data.version !== PackageJSON.version ) {
            throw Error(window.app.$t('project.importVersionNotMatch', [PackageJSON.version, data.version]));
        }

        try {
            let projectId = data.project.id;
            await MdbProject.transactionBegin();

            // pack project
            await MdbProject.deleteAll({id:projectId});
            await MdbProject.create(data.project, true);

            // pack directives
            await MdbDirective.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbDirective, data.directives);
            await MdbDirectiveFolder.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbDirectiveFolder, data.directiveFolders);
            await MdbDirectiveEntry.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbDirectiveEntry, data.directiveEntries);

            // pack panels
            await MdbPanel.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbPanel, data.panels);

            // test
            await MdbTestcase.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbTestcase, data.testUnitTestcases);
            await MdbFunctionalTestcase.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbFunctionalTestcase, data.testFunctionalTestcases);

            // mock 
            await MdbMock.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbMock, data.mocks);

            // environment
            await MdbEnvironment.deleteAll({project_id:projectId});
            await this.applyItemsToModel(MdbEnvironment, data.environments);
            
            await MdbProject.transactionCommit();
            return projectId;
        } catch ( e ) {
            await MdbProject.transactionRollback();
            throw e;
        }
    }

    /**
     * @param {*} modelClass 
     * @param {*} items 
     */
    async applyItemsToModel(modelClass, items) {
        for ( let i=0; i<items.length; i++ ) {
            await modelClass.create(items[i], true);
        }
    }

    /**
     * load zip file
     * @returns {JsZip}
     */
    loadFileContent() {
        let filepath = this.filepath;
        return new Promise((resolve, reject) => {
            window.fs.readFile(filepath, ( err, data ) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}