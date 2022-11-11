import Tester from '../../../../../utils/test/UnitTester.js'
import Popover from '../Popover.vue'
describe('@/communicators/network/Popover.vue', () => {
    it('normal use', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    options : {host:'localhost'},
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose,
                }
            }
        });
        await tester.setup();
        await tester.mount(Popover);
        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(tester.text({ref:'lblHost'}).trim()).toBe('localhost');

        await tester.trigger({ref:'actionClose'},'click');
        expect(deviceClose).toBeCalled();
    })
});