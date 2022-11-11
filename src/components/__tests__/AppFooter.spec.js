import UnitTester from '../../utils/test/UnitTester.js';
import AppFooter from '../AppFooter.vue'
describe('@/components/AppFooter.vue', () => {
    it('basic', async ( ) => {
        let tester = new UnitTester({
            mockStoreGetters : {
                communicators : {
                    com01 : { getDeviceType : () => 'modbus', },
                    com02 : { getDeviceType : () => 'network', },
                },
            },
        });
        await tester.setup();
        await tester.mount(AppFooter, true);
        await tester.eventBusEmit('communicator-online');
        expect(tester.count({ref:'communicators'})).toBe(2);

        tester.wrapper.vm.$store.getters.communicators = {};
        await tester.eventBusEmit('communicator-offline');
        expect(tester.count({ref:'communicators'})).toBe(0);

        window.shell = {openExternal : jest.fn()};
        await tester.click({ref:'iconQQ'});
        expect(window.shell.openExternal).toBeCalledTimes(1);
    });
});