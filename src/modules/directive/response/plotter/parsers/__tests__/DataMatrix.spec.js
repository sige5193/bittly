import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ParserDataMatrix from '../DataMatrix.vue'
import Buffer from '../../../../../../utils/test/Buffer.js'
describe('@/modules/directive/response/plotter/ParserDataMatrix.vue', () => {
    it( 'parse header:FF00 tail:00FF len:dynamic(uint8) channel:2 datatype:uint8', async () => {
        let directive = new MdbDirective();
        let channelDataPush = jest.fn();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    dataType : 'byte',
                    channelCount : 2,
                },
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataMatrix);
        let buffer = Buffer.from([
            0xff,0x00,  0x04,0x01,
            0x02,0x03,  0x04,0x00,
        ]);
        
        wrapper.vm.parse(buffer);
        expect(channelDataPush).toBeCalledTimes(4);
        expect(channelDataPush.mock.calls[0][0]).toEqual([ 0xff, 0x00]);
        expect(channelDataPush.mock.calls[1][0]).toEqual([ 0x04, 0x01]);
        expect(wrapper.vm.getUpdatedOptions().dataType).toBe('byte');
    });

    it('parse empty data', async ( ) => {
        let directive = new MdbDirective();
        
        let tester = new Tester({
            props : {
                directive : directive,
                value : {},
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataMatrix);
        
        expect(wrapper.vm.parse(Buffer.from([]))).toBe(0);
        expect(wrapper.vm.parse(null)).toBe(0);
    })
});