import UnitTester from '../../utils/test/UnitTester.js';
import AppSetting from '../AppSetting.vue'
import MdbRuntimeVariable from '../..//models/MdbRuntimeVariable';
describe('@/components/AppSetting.vue', () => {
    it('basic', async ( ) => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(AppSetting, true);
        await tester.msleep(200);
        
        await tester.wrapper.vm.show();
        await tester.select({ref:'sltLanguage'},'en');
        await tester.msleep(200);
        
        let language = await MdbRuntimeVariable.getVarValue('app_language');
        expect(language).toBe('en');
    });
});