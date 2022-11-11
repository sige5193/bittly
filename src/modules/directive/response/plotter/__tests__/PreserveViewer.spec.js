import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import PreserveViewer from '../PreserveViewer.vue'
describe('@/modules/directive/response/plotter/PreserveViewer.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        directive.responseFormatter.plotter = {};

        let tester = new Tester({
            props : {
                value : directive,
                responseList : [],
            },
            listeners : {
                input : newValue => directive = newValue
            },
        });
        await tester.setup();
        await tester.mount(PreserveViewer);
        await tester.wrapper.setProps({content:Buffer.from([0x01,0x02,0x03,0x04])});
        await tester.wrapper.vm.$nextTick();
        
        await tester.wrapper.setProps({responseList:[]});
        await tester.wrapper.setProps({responseList:[{data:null}]});
        await tester.wrapper.setProps({responseList:[
            {data:Buffer.from([1,2,3,4])},
            {data:Buffer.from([5,6,7,8])},
            {data:null},
        ]});

        await tester.emit({ref:'viewer'},'input',[directive]);

        tester.wrapper.vm.$refs.viewer.exportAsExcel = jest.fn(() => Promise.resolve());
        await tester.wrapper.vm.exportAsExcel();
        expect(tester.wrapper.vm.$refs.viewer.exportAsExcel).toBeCalled();
    })
});