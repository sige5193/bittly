import TestCaseSetup from '../../../utils/test/Setup.js';
import DirectiveEntries from '../DirectiveEntries.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
describe('@/src/modules/test/DirectiveEntries.vue', () => {
    it('normal use', async ( ) => {
        let setup = new TestCaseSetup();
        await setup.setup();

        let project = await setup.setActiveProject('new');
        setup.componentSetProp('projectId', project.id);

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

        let wrapper = await setup.mount(DirectiveEntries);
        await setup.msleep(1000);
        expect(wrapper.findComponent({ref:`entryTitle_${directiveEntry.id}`}).exists()).toBeTruthy();
    })
});