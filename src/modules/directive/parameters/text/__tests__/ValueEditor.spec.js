import Tester from '../../../../../utils/test/UnitTester.js';
import ValueEditor from '../ValueEditor.vue'
describe('@/modules/directive/parameter/text/ValueEditor.vue', () => {
    it('normal use', async ( ) => {
        let params = 'AA';
        let setup = new Tester();
        setup.prop('value', params);
        setup.on('input', newValue => params = newValue);
        await setup.setup();

        let wrapper = await setup.mount(ValueEditor);
        
        let value = wrapper.findComponent({ref:'inputText'}).find('textarea');
        expect(value.element.value).toBe('AA');

        await value.setValue('BB');
        expect(params).toBe('BB');
    })
});