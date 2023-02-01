import TestCaseSetup from '../../../utils/test/UnitTester.js';
import ExportMarkdown from '../ExportMarkdown.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
describe('@/src/modules/document/ExportMarkdown.vue', () => {
    it('normal use', async ( done ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.activeNewProject();

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

        let wrapper = await setup.mount(ExportMarkdown);
        window.dialog = {
            showSaveDialogSync( options ) {
                return 'test-example';
            }
        };
        window.fs = {
            promises : {
                writeFile ( path, content ) {
                    expect(path).toBe('test-example');
                    expect(content).toContain('# TEST');
                    done();
                },
            },
        };
        wrapper.vm.start();
        await setup.msleep(500);
        await setup.click({ref:'btnStart'});
    })
});