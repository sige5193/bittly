import TestCaseSetup from '../../../utils/test/Setup.js';
import ExportPDF from '../ExportPDF.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
const fs = require('fs');
describe('@/src/modules/document/ExportPDF.vue', () => {
    it('normal use', async (  ) => {
        window.fs = fs;
        window.dialog = {
            showSaveDialogSync( options ) {
                return 'TEST.pdf';
            }
        };
        
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.setActiveProject('new');
        project.name = 'TEST';
        project.save();

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.name = 'TEST';
        directive.target = {};
        directive.requestFormat = 'text';
        directive.requestContent = {text:'AA{{value}}BB{{panel.RTV001}}CC'};
        directive.responseFormatter = {};
        await directive.save();

        let directiveEntry = new MdbDirectiveEntry();
        directiveEntry.type = 'directive';
        directiveEntry.target = directive.id;
        directiveEntry.parentId = NIL_UUID;
        directiveEntry.projectId = project.id;
        await directiveEntry.save();

        let wrapper = await setup.mount(ExportPDF);
        await setup.msleep(1000);
        wrapper.vm.open();
        await setup.msleep(500);
        await setup.comButtonClick(wrapper, 'btnStart');
        await setup.msleep(1000);

        expect(fs.existsSync('TEST.pdf')).toBeTruthy();
        fs.unlinkSync('TEST.pdf');
    }, 30000);
});