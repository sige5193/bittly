import TestCaseSetup from '@/utils/test/Setup.js';
import ValueEditor from '../ValueEditor.vue'
describe('@/modules/directive/parameter/text/ValueEditor.vue', () => {
    it('normal use', async ( ) => {
        let params = 'AA';
        let setup = new TestCaseSetup();
        setup.componentSetProp('value',params);
        setup.componentOn('input', ( newValue ) => {
            params = newValue;
        });
        await setup.setup();

        let wrapper = await setup.mount(ValueEditor);
        
        let value = wrapper.findComponent({ref:'inputText'}).find('textarea');
        expect(value.element.value).toBe('AA');

        await value.setValue('BB');
        expect(params).toBe('BB');
    })
});