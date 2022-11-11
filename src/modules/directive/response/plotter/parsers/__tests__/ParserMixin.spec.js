import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ParserMixin from '../ParserMixin.js'
describe('@/modules/directive/response/plotter/ParserDataMatrix.vue', () => {
    it( 'basic', async () => {
        let testCom = {
            name : 'TEST-COM',
            mixins : [ParserMixin],
            template : '<div></div>',
        };

        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : {},
                directive : directive
            },
            listeners : {
                input : value => expect(value).toBeNull(),
                'option-update' : () => {},
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(testCom);
        wrapper.vm.actionForceUpdate();

        // getUpdatedOptions
        tester.expectError(() => wrapper.vm.getUpdatedOptions(), 'getUpdatedOptions() does not implemented');

        wrapper.vm.getUpdatedOptions = jest.fn(() => null);
        wrapper.vm.settingOk();
        await tester.msleep(100);

        // channel name
        expect(wrapper.vm.getChannelLabel(1)).toBe('CH 1');
        wrapper.vm.channelNames = ['TEST'];
        expect(wrapper.vm.getChannelLabel(0)).toBe('TEST');
    });
});