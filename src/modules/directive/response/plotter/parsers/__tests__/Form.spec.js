import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Form from '../Form.vue'
describe('@/modules/directive/response/plotter/parsers/Form.vue', () => {
    it( 'basic', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {name:'F001',type:'byte',format:'hex'},
            {name:'F002',type:'char'},
            {name:'',type:'byte',format:'hex'},
            {name:'',type:'bytes',length:1},
        ];

        let tester = new Tester({
            props : {
                channelDataPush,
                value : {form : [
                    {enable:true,expression:'{{value}}',name:'F001',type:'byte',format:'hex'},
                    {enable:true,expression:'{{value}}',name:'F002',type:'char'},
                    {enable:true,expression:'{{value}}',name:'',type:'byte',format:'hex'},
                    {enable:true,expression:'{{value}}',name:'',type:'bytes',length:1},
                ]},
                directive : directive,
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Form);

        wrapper.vm.parse(Buffer.from([
            0x01,0x32,0x03,0xFF,
            0x04,0x35,0x06,0xFF,
        ]));
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([1,2,3,0]);
        expect(channelDataPush.mock.calls[1][0]).toStrictEqual([4,5,6,0]);

        // empty data
        expect(wrapper.vm.parse(null)).toEqual(0);

        // parse not full data
        expect(wrapper.vm.parse(Buffer.from([0x01,0x32]))).toBe(0);
    });
});