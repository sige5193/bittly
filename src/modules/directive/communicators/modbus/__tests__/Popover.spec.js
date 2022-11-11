import Tester from '../../../../../utils/test/UnitTester.js'
import Popover from '../Popover.vue'
describe('@/communicators/modbus/Popover.vue', () => {
    it('modbus rtu', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    options : {modbusMode:'RTU',modbusSerialport:'COM8'},
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose,
                }
            }
        });
        await tester.setup();
        await tester.mount(Popover);
        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(tester.text({ref:'lblSerialport'}).trim()).toBe('COM8');

        await tester.trigger({ref:'actionClose'},'click');
        expect(deviceClose).toBeCalled();
    })

    it('modbus tcp', async ( ) => {
        let deviceClose = jest.fn();
        let tester = new Tester({
            props : {
                device : {
                    options : {modbusMode:'TCP-IP',modbusHost:'127.0.0.1',modbusPort:'502'},
                    getDataSendSize: () => 10,
                    getDataReceiveSize : () => 20,
                    close : deviceClose,
                }
            }
        });
        await tester.setup();
        await tester.mount(Popover);
        await tester.trigger({ref:'tagDevice'}, 'click');
        expect(tester.text({ref:'lblAddress'}).trim()).toBe('127.0.0.1:502');
    })
});