import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/Editor.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        let executor = {};
        let directiveRequestFormatChange = jest.fn();

        let tester = new Tester({
            props : {
                directive : directive,
                executor : executor,
                enable : false, 
            },
            listeners : {
                'directive-request-format-change' : directiveRequestFormatChange,
            },
        });
        await tester.setup();
        await tester.mount(Editor);
        expect(tester.exists({ref:'emptyPlaceholder'})).toBeTruthy();

        tester.wrapper.setProps({enable:true});
        await tester.wrapper.vm.$nextTick();
        expect(tester.exists({ref:'emptyPlaceholder'})).toBeFalsy();

        await tester.emit({ref:'radioGroupParamType'},'change');
        expect(directiveRequestFormatChange).toBeCalled();
    })
});