import TestCaseSetup from '@/utils/test/Setup.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/hex/Editor.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();

        let setup = new TestCaseSetup();
        setup.componentSetProp('value',directive);
        setup.componentOn('input', ( newValue ) => {
            directive = newValue;
        });
        await setup.setup();

        let wrapper = await setup.mount(Editor);

        await setup.comInputChange(wrapper, 'inputarea', "AA BB CC DD",'textarea');
        expect(directive.requestContent.hex).toBe('AA BB CC DD');
    })
});