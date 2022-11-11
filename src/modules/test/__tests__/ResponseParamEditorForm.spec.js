import TestCaseSetup from '../../../utils/test/Setup.js';
import ResponseParamEditorForm from '../ResponseParamEditorForm.vue'
import MdbDirective from '@/models/MdbDirective.js'
describe('@/src/modules/test/ResponseParamEditorForm.vue', () => {
    it('normal use', async () => {
        let directive = new MdbDirective();
        directive.responseFormatter = {
            fields : [
                {name:'Name0', type:'string'}
            ],
        };

        let response = null;
        let setup = new TestCaseSetup();
        setup.componentOn('input', (newValue) => response = newValue);
        setup.componentSetProp('directive', directive)
        await setup.setup();

        let wrapper = await setup.mount(ResponseParamEditorForm);
        await setup.msleep(1000);
        
        let inputValues = wrapper.findAllComponents({ref:'inputValue'});
        expect(inputValues.length).toBe(1);
        await inputValues.at(0).setValue('TEST-CONTENT');
        expect(response.length).toBe(1);
        expect(response[0].value).toBe('TEST-CONTENT');
        expect(response[0].comparator).toBe('Equal');
    })
});