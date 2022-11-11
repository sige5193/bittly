import Popover from '../Popover.vue'
import Tester from '../../../../../utils/test/UnitTester.js'
describe('@/communicators/bluetooth/Popover.vue', () => {
    it('normal use', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    handler : {
                        getDeviceTitle() { return 'TITLE'; }
                    },
                    options : {
                        btType : 'classic',
                        btAddress : 'TEST-ADDRESS',
                    },
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose
                },
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(Popover);

        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(wrapper.findComponent({ref:'lblClassicAddress'}).text().trim()).toBe('TEST-ADDRESS');

        await tester.trigger({ref:'btnClose'},'click');
        await tester.trigger({ref:'btnClose'},'click');
        expect(deviceClose).toBeCalled();
    })
});