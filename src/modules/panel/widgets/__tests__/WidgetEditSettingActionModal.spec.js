import MdbDirective from '../../../../models/MdbDirective.js';
import MdbPanel from '../../../../models/MdbPanel.js';
import Tester from '../../../../utils/test/UnitTester.js'
import WidgetEditSettingActionModal from '../WidgetEditSettingActionModal.vue'
describe('@/modules/panel/widgets/WidgetEditSettingActionModal.vue', () => {
    it('normal use', async () => {
        let widget = {};
        let panel = {
            variables : [{name:'VAR001'}],
        };
        let settingOk = jest.fn();
        let settingCancel = jest.fn();
        let tester = new Tester({
            props : {
                widget,
                panel,
                actions : ['directive','variable', 'script'],
                tooltipAvailable : true,
            },
        });
        await tester.setup();
        await tester.mount(WidgetEditSettingActionModal);
        let settingCallback = jest.fn();
        tester.wrapper.vm.open().then(settingCallback);
        await tester.msleep(200);

        await tester.input({ref:'inputTooltip'},"TOOLTIP");
        expect(widget.tooltip).toBe('TOOLTIP');

        // switch action to variable
        await tester.radioGroupSelect({ref:'radioGroupAction'},'variable');
        await tester.emit({ref:'variableSelector'}, 'input', ['VAR001']);
        expect(widget.action).toBe('variable');
        expect(widget.targetVariable).toBe('VAR001');

        // switch action to script
        await tester.radioGroupSelect({ref:'radioGroupAction'},'script');
        expect(widget.action).toBe('script');
        // click help link
        window.shell = {openExternal:jest.fn()};
        await tester.click({ref:'btnScriptHelp'});
        expect(window.shell.openExternal).toBeCalled();
        // insert script snippet
        let insertSnippet = jest.fn();
        tester.wrapper.vm.$refs.actionCodeEditor.insertSnippet = insertSnippet;
        tester.wrapper.vm.actionScriptSnippetClick({key:'msleep'});
        expect(insertSnippet.mock.calls[0][0]).toMatch('bittly.msleep');

        // switch action to directive
        await tester.radioGroupSelect({ref:'radioGroupAction'},'directive');
        expect(widget.action).toBe('directive');
        let directive = new MdbDirective();
        await tester.emit({ref:'directiveTreeSelect'}, 'select', [directive]);
        // parameter editor switch to text editor
        await tester.radioGroupSelect({ref:'radioGroupDirectiveParamFormat'},'text');
        await tester.emit({ref:'comDirectiveParamEditor'},'input', ['TEST-PARAM-CONTENT']);
        expect(widget.directiveParams).toBe('TEST-PARAM-CONTENT');
        // response parser switch to raw
        await tester.radioGroupSelect({ref:'radioGroupDirectiveResponseParser'},'raw');
        expect(widget.directiveResponseParser).toBe('raw');
        // response parser switch to form
        directive.responseFormatter.fields = [
            {name:'F01',type:'byte',format:'hex'},
        ];
        await tester.radioGroupSelect({ref:'radioGroupDirectiveResponseParser'},'form');
        expect(widget.directiveResponseParser).toBe('form');
        await tester.emit({ref:'directiveResFormParserVariableSelector'}, 'input', ['VAR001'], null, 0);
        expect(widget.directiveResponseMap[0].variable).toBe('VAR001');
        // response parser switch to json
        await tester.radioGroupSelect({ref:'radioGroupDirectiveResponseParser'},'json');
        await tester.click({ref:'btnDirectiveResJsonParserMapAdd'});
        await tester.input({ref:'directiveResJsonParserMapExpr'}, 'data.user.name',null,0);
        await tester.emit({ref:'directiveResJsonParserMapVariable'}, 'input', ['VAR001'], null, 0);
        expect(widget.directiveResponseJsonMap[0].expression).toBe('data.user.name');
        expect(widget.directiveResponseJsonMap[0].variable).toBe('VAR001');
        await tester.click({ref:'directiveResJsonParserMapDelete'}, null, 0);
        expect(widget.directiveResponseJsonMap.length).toBe(0);

        // setting cancel & ok
        await tester.click({ref:'btnOk'});
        expect(settingCallback).toBeCalled();
    }, 10000)

    it('widget action default value', async () => {
        let widget = {};
        let panel = new MdbPanel();
        let tester = new Tester({
            props : {
                widget,
                panel,
                enable : true,
                actions : 'variable'
            },
        });
        await tester.setup();
        await tester.mount(WidgetEditSettingActionModal);
        tester.wrapper.vm.open();
        await tester.msleep(200);
        expect(widget.action).toBe('variable');

        // set default action 
        widget = {};
        tester = new Tester({
            props : {
                widget,
                panel,
                enable : true,
                actions : ['variable','script'],
                defaultAction : 'script',
            },
        });
        await tester.setup();
        await tester.mount(WidgetEditSettingActionModal);
        tester.wrapper.vm.open();
        await tester.msleep(200);
        expect(widget.action).toBe('script');
    });
});