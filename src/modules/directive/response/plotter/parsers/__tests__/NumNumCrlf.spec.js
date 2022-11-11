import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ParserNumNumCrlf from '../NumNumCrlf.vue'
describe('@/modules/directive/response/plotter/ParserDataMatrix.vue', () => {
    it( 'basic', async () => {
        let directive = new MdbDirective();
        
        let channelDataPush = jest.fn();
        let tester = new Tester({
            props : {
                value : {},
                directive : directive,
                channelDataPush : channelDataPush,
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserNumNumCrlf);

        wrapper.vm.parse("1 2\r\n3 qaz 5\r\n9");
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toEqual([1, 2]);
        expect(channelDataPush.mock.calls[1][0]).toEqual([3, NaN, 5]);
    });
});