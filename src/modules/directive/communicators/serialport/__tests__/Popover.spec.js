import Tester from '../../../../../utils/test/UnitTester.js'
import Popover from '../Popover.vue'
describe('@/communicators/serialport/Popover.vue', () => {
    it('normal use', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    options : {path:'COM9'},
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose,
                }
            }
        });
        await tester.setup();
        await tester.mount(Popover);
        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(tester.text({ref:'lblPath'}).trim()).toBe('COM9');

        await tester.trigger({ref:'actionClose'},'click');
        expect(deviceClose).toBeCalled();
    })
});