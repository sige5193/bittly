jest.mock('@amap/amap-jsapi-loader', () => {
    return {
        load : () => {
            return {
                Map : class {
                    destroy() {}
                    clearMap() {}
                    add() {}
                    panTo(){}
                },
                Marker : class {

                }
            };
        }
    };
}, {virtual:true});
import WidgetTestHelper from '../../WidgetTestHelper.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/map/Run.vue', () => {
    it('normal use', async () => {
        let widget = {
            sizeHeight : '300',
            sizeWidth : '300',
            dataSource : 'variable',
            sourceVariableLong:'Long',
            sourceVariableLat : 'Lat',
        };
        let env = await WidgetTestHelper.setupEnvForRunning(widget);
        let wrapper = await env.tester.mount(Run);
        await env.widgetRefresh();

        // data source : expression
        widget.dataSource = 'expression';
        widget.sourceExprLong = '{{VAR01}}';
        widget.sourceExprLat = '{{VAR01}}';
        env.runtime.variables.VAR01 = '33';
        await env.widgetRefresh();

        wrapper.destroy();
    })
});