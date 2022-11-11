import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import PreserveViewer from '../PreserveViewer.vue'
describe('@/modules/directive/parameter/hex/PreserveViewer.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.responseCharset = 'utf-8';

        let tester = new Tester({
            props : {
                directive : directive,
                responseList : [
                    {key:1,time:new Date(), data:Buffer.from('001')}, 
                    {key:2,time:new Date(), data:Buffer.from('002')},
                ]
            },
        });
        await tester.setup();

        let wrapper = await tester.mount(PreserveViewer);
        let dataCells = wrapper.findAll('.data-cell');
        expect(dataCells.length).toBe(2);
        expect(dataCells.at(0).text()).toBe('30 30 31');
        expect(dataCells.at(1).text()).toBe('30 30 32');

        wrapper.setProps({responseList:[
            {key:1,time:new Date(), data:Buffer.from('001')},
        ]});
        await tester.msleep(100);
    })
});