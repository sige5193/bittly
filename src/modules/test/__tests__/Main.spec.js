import TestCaseSetup from '../../../utils/test/Setup.js';
import Main from '../Main.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbDirectiveEntry from '../../../models/MdbDirectiveEntry.js'
import MdbTestcase from '../../../models/MdbTestcase.js'
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

        // setup testcase
        let testcase = new MdbTestcase();
        testcase.title = 'TESTCASE-001';
        testcase.paramFormat = 'text';
        testcase.params = {value:'how are you ?'};
        testcase.expectFormat = 'text';
        testcase.expect = {value:'how are you ?'};
        testcase.beforeScript = 'window.testFunc1("before-script");';
        testcase.timeout = 100;
        testcase.afterScript = 'window.testFunc2("after-script");';
        testcase.projectId = project.id;
        testcase.directiveId = directive.id;
        await testcase.save();

        let wrapper = await setup.mount(Main);
        await setup.comEmit(wrapper, 'entries', 'directive-click', directive);
        await setup.msleep(500);

        let testcases = wrapper.findAllComponents({ref:'testcase'});
        expect(testcases.length).toBe(1);
    })
});