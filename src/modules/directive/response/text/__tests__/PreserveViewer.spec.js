import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import PreserveViewer from '../PreserveViewer.vue'
describe('@/modules/directive/parameter/PreserveViewer.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();
        directive.responseCharset = 'utf-8';

        let tester = new Tester({
            props : {
                directive : directive,
                responseList : []
            }
        });
        await tester.setup();

        let wrapper = await tester.mount(PreserveViewer);
        wrapper.setProps({responseList:[
            {key:1,time:new Date(), data:Buffer.from('001')},
            {key:2,time:new Date(), data:Buffer.from('002')}
        ]});
        await wrapper.vm.$nextTick();
        
        let dataCells = wrapper.findAll('.directive-response-text-entry-content');
        expect(dataCells.length).toBe(2);
        expect(dataCells.at(0).text()).toBe('001');
        expect(dataCells.at(1).text()).toBe('002');
    })
});