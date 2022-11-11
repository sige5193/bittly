import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ValueEditor from '../ValueEditor.vue'
describe('@/modules/directive/parameter/form/ValueEditor.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'xxx', name:'NAME',type:'byte',format:'hex',value:'FF',desc:'DESC'},
            {key:'02', name:'FILE',type:'file',value:'',desc:'DESC'}
        ];

        let params = null;
        let tester = new Tester({
            props : {
                value : params,
                directive : directive,
            },
            listeners : {
                input : newValue => params = newValue,
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ValueEditor);
        
        // select file
        await tester.emit({ref:'uploadFile_1'}, 'change', [{file:{path:'demo.file'}}, 1]);
        expect(params[1].value).toBe('demo.file');

        let value01 = wrapper.findComponent({ref:'inputValue_0'}).find('input');
        expect(value01.element.value).toBe('FF');

        await value01.setValue('AA');
        expect(params[0].value).toBe('AA');

        wrapper.setProps({value:[{key:'xxx', name:'NAME',type:'byte',format:'hex',value:'FF',desc:'DESC'}]});
        await wrapper.vm.$nextTick();

        let directiveNew = new MdbDirective();
        directiveNew.requestContent.form = [];
        wrapper.setProps({directive:directiveNew,value:[]});
        await wrapper.vm.$nextTick();
    })
});