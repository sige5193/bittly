import UnitTester from '../../utils/test/UnitTester.js';
import AppFooter from '../AppFooter.vue'
describe('@/components/AppFooter.vue', () => {
    it('basic', async ( ) => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppFooter, true);

        window.shell.openExternal = jest.fn();
        await tester.click({ref:'iconQQ'});
        expect(window.shell.openExternal).toBeCalledTimes(1);
    });
});