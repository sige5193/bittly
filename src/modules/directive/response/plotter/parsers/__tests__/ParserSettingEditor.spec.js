import Tester from '../../../../../../utils/test/UnitTester.js';
import ParserSettingEditor from '../ParserSettingEditor.vue'
describe('@/modules/directive/response/plotter/ParserSettingEditor.vue', () => {
    it( 'basic', async () => {
        let tester = new Tester();
        await tester.setup();
        await tester.mount(ParserSettingEditor);
        
        await tester.click({ref:'btnOpen'});
        expect(tester.exists({ref:'modalSetting'})).toBeTruthy();

        tester.wrapper.vm.$parent.settingOk = jest.fn();
        await tester.trigger({ref:'btnOK'},'click');
        expect(tester.wrapper.vm.$parent.settingOk).toBeCalled();
    });
});