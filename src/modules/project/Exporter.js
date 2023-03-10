import PackageJSON from '../../../package.json'
import MdbDirective from '../../models/MdbDirective';
import MdbDirectiveEntry from '../../models/MdbDirectiveEntry';
import MdbDirectiveFolder from '../../models/MdbDirectiveFolder';
import MdbEnvironment from '../../models/MdbEnvironment';
import MdbFunctionalTestcase from '../../models/MdbFunctionalTestcase';
import MdbMock from '../../models/MdbMock';
import MdbPanel from '../../models/MdbPanel';
import MdbProject from '../../models/MdbProject';
import MdbTestcase from '../../models/MdbTestcase';
import MyDate from '../../utils/datatype/MyDate';
import JSZip from 'jszip';
export default class Exporter {
    /**
     * @param {*} projectId 
     */
    constructor(projectId) {
        this.projectId = projectId;
    }

    /**
     * execute exporting
     */
    async execute() {
        let projectId = this.projectId;

        let content = {};
        content.version = PackageJSON.version;
        content.time = MyDate.format(new Date, 'Y-m-d H:i:s');

        // pack project
        let project = await MdbProject.findOne(projectId);
        content.project = project.getData();

        // pack directives
        let directives = await MdbDirective.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'directives', directives);
        let folders = await MdbDirectiveFolder.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'directiveFolders', folders);
        let entries = await MdbDirectiveEntry.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'directiveEntries', entries);

        // pack panels
        let panels = await MdbPanel.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'panels', panels);

        // test
        let unitTestcases = await MdbTestcase.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'testUnitTestcases', unitTestcases);
        let functionalTestcases = await MdbFunctionalTestcase.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'testFunctionalTestcases', functionalTestcases);

        // mock 
        let mocks = await MdbMock.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'mocks', mocks);

        // environment
        let envs = await MdbEnvironment.findAll({project_id:projectId});
        this.setContentPropertyByModels(content, 'environments', envs);

        let filepath = window.remote.dialog.showSaveDialogSync({defaultPath:`${project.name}.zip`});
        if ( undefined === filepath ) {
            return ;
        }

        let zip = new JSZip();
        zip.file("data.json", JSON.stringify(content));
        let zipBuffer = await zip.generateAsync({type:"nodebuffer"});
        window.fs.writeFileSync(filepath, zipBuffer);
        window.remote.shell.showItemInFolder(filepath);
    }
    
    /**
     * push db models to content property
     */
    setContentPropertyByModels(content, name, models) {
        content[name] = [];
        for ( let i=0; i<models.length; i++ ) {
            let data = models[i].getData();
            content[name].push(data);
        }
    }
}