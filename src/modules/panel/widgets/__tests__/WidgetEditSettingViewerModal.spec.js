import Tester from '../../../../utils/test/UnitTester.js'
import WidgetEditSettingViewerModal from '../WidgetEditSettingViewerModal.vue'
describe('@/modules/panel/widgets/WidgetEditSettingViewerModal.vue', () => {
    it('basic', async () => {
        let widget = {};
        let panel = {
            variables : [{name:'VAR001'}],
        };

        let settingOk = jest.fn();
        let settingCancel = jest.fn();
        let tester = new Tester({
            props : {
                widget : widget,
                panel : panel,
                dataSources : ['variable', 'script'],
                dataSourceVars : [{name:'V001'}],
                resizable : true,
                tooltipAvailable : true,
            },
        });
        await tester.setup();

        await tester.mount(WidgetEditSettingViewerModal);
        let settingCallback = jest.fn();
        tester.wrapper.vm.open().then(settingCallback);
        await tester.msleep(200);

        // update size
        await tester.input({ref:'inputSizeHeight'}, 500);
        await tester.input({ref:'inputSizeWidth'}, 500);
        expect(widget.sizeHeight).toBe(500);
        expect(widget.sizeWidth).toBe(500);

        // update tooltip
        await tester.input({ref:'inputTooltip'}, 'TEST-TOOLTIP');
        expect(widget.tooltip).toBe('TEST-TOOLTIP');

        // select data source : variable
        await tester.radioGroupSelect({ref:'radioGroupDataSource'}, 'variable');
        await tester.emit({ref:'variableSelector'}, 'input', ['VAR001'], null, 0);
        expect(widget.dataSource).toBe('variable');
        expect(widget.V001).toBe('VAR001');

        // switch to script
        await tester.radioGroupSelect({ref:'radioGroupDataSource'}, 'script');
        expect(widget.dataSource).toBe('script');
        let insertSnippet = jest.fn()
        tester.wrapper.vm.$refs.actionCodeEditor.insertSnippet = insertSnippet;
        tester.wrapper.vm.actionScriptSnippetClick({key:'msleep'});
        expect(insertSnippet.mock.calls[0][0]).toMatch('bittly.msleep');

        // click help link 
        window.shell = {openExternal:jest.fn()};
        await tester.click({ref:'btnHelpLink'});
        expect(window.shell.openExternal).toBeCalled();

        // emit ok and cancel
        await tester.click({ref:'btnOk'});
        expect(settingCallback).toBeCalled();
    })
});