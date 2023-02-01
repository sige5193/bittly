import Tester from '../../../utils/test/UnitTester.js'
import Execute from '../Execute.vue'
import MdbDirective from '../../../models/MdbDirective.js'
import MockSerialport from '../communicators/serialport/__tests__/mocks/MockSerialport.js';
describe('@/src/modules/directive/Execute.vue', () => {
    it('new directive save', async() => {
        let directiveSavedCallback = jest.fn();
        let folderSelectSelect = jest.fn();
        let value = {hasChanged : false, model : null};

        let tester = new Tester({
            props : { value : value, },
            stubs : {
                'folder-select' : {
                    template : '<div></div>',
                    methods : {select : folderSelectSelect}
                }
            },
            listeners : {
                'directive-saved' : directiveSavedCallback,
            },
        });
        await tester.setup();
        await tester.activeNewProject();
        await tester.mount(Execute, true);
        await tester.msleep(500);

        // targetEditor : target-type-change
        await tester.emit({ref:'targetEditor'},'target-type-change', [{defaultDataType:'byte',defaultResponseViewer:'form'}]);
        await tester.emit({ref:'targetEditor'},'parameter-editor-enable-change',[false]);

        // parameterEditor : directive-request-format-change
        await tester.emit({ref:'parameterEditor'},'directive-request-format-change');

        // folder not selected
        folderSelectSelect.mockRejectedValue('');
        await tester.click({ref:'btnSave'});
        await tester.msleep(500);

        // folder selected
        folderSelectSelect.mockResolvedValue('0');
        await tester.click({ref:'btnSave'});
        await tester.msleep(500);

        expect(directiveSavedCallback).toBeCalled();
        expect(directiveSavedCallback.mock.calls[0][0]).toBeTruthy();
        expect(directiveSavedCallback.mock.calls[0][1].projectId).toBe(tester.project.id);
        expect(directiveSavedCallback.mock.calls[0][2].projectId).toBe(tester.project.id);
    });

    it('directive update', async() => {
        let directiveSavedCallback = jest.fn();
        let directive = new MdbDirective();
        directive.requestFormat = 'none';
        
        let value = {hasChanged : false, model : directive};

        let tester = new Tester({
            props : { value : value, },
            listeners : {
                'directive-saved' : directiveSavedCallback,
            },
        });
        await tester.setup();
        await directive.save();

        await tester.activeNewProject();
        await tester.mount(Execute, true);
        await tester.msleep(500);

        // targetEditor : target-type-change
        await tester.emit({ref:'targetEditor'},'target-type-change', [{defaultDataType:'byte',defaultResponseViewer:'form'}]);
        await tester.emit({ref:'targetEditor'},'parameter-editor-enable-change',[true]);

        // enable name quick edit
        await tester.emit({ref:'btnNameQuickEdit'}, 'click');
        await tester.msleep(200);
        expect(tester.dataGet('enableNameQuickEdit')).toBeTruthy();
        
        directive.name = 'NEW-NAME';
        await tester.emit({ref:'inputQuickName'},'pressEnter')

        await tester.click({ref:'btnSave'});
        await tester.msleep(500);
        expect(directiveSavedCallback).toBeCalled();
        expect(directiveSavedCallback.mock.calls[0][0]).toBeFalsy();
    });

    it('execute', async () => {
        let mock = MockSerialport.setup();
        mock.enableEcho = false;

        let responseViewerNewResponseData = jest.fn();
        let responseViewerStartNewResponse = jest.fn();
        let directive = new MdbDirective();
        directive.target = {type:"SerialPort",parity:"none",stopBits:"1",dataBits:"8",baudRate:"9600",path:"COM4"};
        directive.requestFormat = 'text';
        directive.requestContent = {text:"how are you ?"};
        
        let value = {hasChanged : false, model : directive};
        let tester = new Tester({
            props : { value : value, },
            stubs : {
                'response-viewer' : {
                    template : '<div></div>',
                    methods : {
                        startNewResponse : responseViewerStartNewResponse,
                        newResponseData : responseViewerNewResponseData,
                    }
                }
            },
        });
        await tester.setup();
        await tester.activeNewProject();
        directive.projectId = tester.project.id;
        await directive.save();
        
        await tester.mount(Execute, true);
        await tester.msleep(200);
        
        await tester.wrapper.vm.actionSend();
        await tester.msleep(200);
        expect(mock.write).toBeCalled();

        // response data twice
        let data = mock.write.mock.calls[0][1];
        mock.response(data);
        await tester.msleep(200);
        mock.response(data);
        await tester.msleep(200);

        expect(responseViewerNewResponseData).toBeCalledTimes(2);
        expect(responseViewerStartNewResponse).toBeCalled();
        expect(tester.dataGet('responseData').toString()).toBe('how are you ?how are you ?');

        // Failed to send
        mock.write.mockImplementation(() => { throw Error('TEST-ERROR'); });
        await tester.wrapper.vm.actionSend();
        await tester.msleep(200);
        expect(tester.dataGet('errorMessage')).toBe('TEST-ERROR');
    });

    it('ui operations', async() => {
        let scriptEditorOpen = jest.fn();
        let configEditorOpen = jest.fn();
        let extActionShareExecute = jest.fn();
        let value = {hasChanged : false, model : null};
        let tester = new Tester({
            props : { value : value, },
            stubs : {
                'script-editor' : {
                    template : '<div></div>',
                    methods : {open : scriptEditorOpen}
                },
                'config-editor' : {
                    template : '<div></div>',
                    methods : {open : configEditorOpen}
                },
                'ext-action-share' : {
                    template : '<div></div>',
                    methods : {execute : extActionShareExecute}
                },
            },
        });
        await tester.setup();
        await tester.activeNewProject();
        await tester.mount(Execute, true);
        await tester.msleep(500);

        // open script editor modal and cancel
        scriptEditorOpen.mockRejectedValueOnce('');
        await tester.click({ref:'btnOpenScriptModal'});

        // open config modal and cancel.
        configEditorOpen.mockRejectedValueOnce('');
        await tester.click({ref:'btnOpenConfigModal'});

        // share 
        await tester.dropdownMenuClick(
            {ref:'btnExtAction'},
            {ref:'menuBtnExtAction'},
            {key:'directiveExtActionShare',domEvent:{target:{dataset:{}}}}
        );
        expect(extActionShareExecute).toBeCalled();

        // move mouse
        await tester.dispatchEvent('.execute', new MouseEvent('mousemove', {}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mouseup', {}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mouseleave', {}));
        await tester.msleep(200);
        
        // move seperator-bar and leave executor
        let directiveExecutorResized = jest.fn();
        tester.eventBusOn('directive-executor-resized', directiveExecutorResized);
        await tester.dispatchEvent('.seperator-bar', new MouseEvent('mousedown', {}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mousemove', {clientY:-1}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mousemove', {clientY:100}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mouseleave'));
        await tester.msleep(200);
        expect(directiveExecutorResized).toBeCalledTimes(1);

        // move seperator-bar and mouse up
        await tester.dispatchEvent('.seperator-bar', new MouseEvent('mousedown', {}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mousemove', {clientY:100}));
        await tester.msleep(200);
        await tester.dispatchEvent('.execute', new MouseEvent('mouseup'));
        await tester.msleep(200);
        expect(directiveExecutorResized).toBeCalledTimes(2);
    });
});