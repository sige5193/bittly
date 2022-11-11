jest.mock('@amap/amap-jsapi-loader', () => {
    return {
        load : () => {
            return {
                Map : class {
                    destroy() {}
                }
            };
        }
    };
}, {virtual:true});
import TWidgetTestHelper from '../../WidgetTestHelper.js'
import Edit from '../Edit.vue'
describe('@/modules/panel/widgets/map/Edit.vue', () => {
    it('basic', async () => {
        let env = await TWidgetTestHelper.setupEnvForEdit();
        let wrapper = await env.tester.mount(Edit);

        await env.settingStart();
        let modalSetting = wrapper.findComponent({ref:'setting'});
        let selectSourceVars = modalSetting.findAllComponents({ref:'variableSelector'});
        selectSourceVars.at(0).vm.$emit('input', 'VAR_01');
        await selectSourceVars.at(0).vm.$nextTick();
        selectSourceVars.at(1).vm.$emit('input', 'VAR_01');
        await selectSourceVars.at(1).vm.$nextTick();

        await env.settingOk();
        expect(env.widget.sourceVariableLong).toBe('VAR_01');
        expect(env.widget.sourceVariableLat).toBe('VAR_01');
        wrapper.destroy();

        expect(Edit.widgetInfo().name).toBe('map');
    })
});