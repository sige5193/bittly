import TestCaseSetup from '../../../utils/test/UnitTester.js';
import Main from '../Main.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
describe('@/src/modules/document/Main.vue', () => {
    it('normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.activeNewProject();
        setup.prop('projectId', project.id);

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

        let wrapper = await setup.mount(Main);
        await setup.msleep(1000);
        await setup.emit({ref:'entryMenu'}, 'directive-click', [directive]);
        
        let header = wrapper.findComponent({ref:'header'});
        expect(header.props('title')).toBe('TEST');
    })
});