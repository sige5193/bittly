import Tester from '../../../../../utils/test/UnitTester.js'
import Popover from '../Popover.vue'
describe('@/communicators/mqtt/Popover.vue', () => {
    it('normal use', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    options : {mqttUri:'mqtt://127.0.0.1:1883'},
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose,
                }
            }
        });
        await tester.setup();
        await tester.mount(Popover);
        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(tester.text({ref:'lblUri'}).trim()).toBe('mqtt://127.0.0.1:1883');

        await tester.trigger({ref:'actionClose'},'click');
        expect(deviceClose).toBeCalled();
    })
});