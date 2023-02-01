import MdbDirective from '../../../../models/MdbDirective.js';
import MdbTestcase from '../../../../models/MdbTestcase.js';
import Tester from '../../../../utils/test/UnitTester.js';
import Viewer from '../Viewer.vue'
describe('@/modules/directive/response/Viewer.vue', () => {
    it('request and response log', async () => {
        let tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'stream';
        await tester.wrapper.vm.$nextTick();

        let handlerMock = jest.fn(() => {});
        tester.wrapper.vm.$refs.streamViewer.newRequestData = handlerMock;
        tester.wrapper.vm.$refs.streamViewer.newResponseData = handlerMock;

        tester.wrapper.vm.newRequestData(Buffer.from('123'));
        await tester.wrapper.vm.$nextTick();
        tester.wrapper.vm.newResponseData(Buffer.from('456'));
        await tester.wrapper.vm.$nextTick();
        
        expect(handlerMock).toBeCalledTimes(2);
    })

    it('preserve mode responser handle', async () => {
        // preserve mode disabled
        let tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'text';
        await tester.msleep(100);

        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.vm.$nextTick();
        tester.wrapper.setProps({responseData:Buffer.from('HELLO')});
        await tester.wrapper.vm.$nextTick();
        expect(tester.wrapper.vm.preservedResponseData.length).toBe(0);

        // enable preserve mode
        await tester.emit({ref:'switchPreserveMode'}, 'change', [true]);
        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.vm.$nextTick();
        await tester.wrapper.setProps({responseData:Buffer.from("ABCD")});
        expect(tester.wrapper.vm.preservedResponseData.length).toBe(1);
        await tester.wrapper.setProps({responseData:Buffer.from("ABCDEDFG")});
        expect(tester.wrapper.vm.preservedResponseData.length).toBe(1);
        // start new response 
        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.vm.$nextTick();
        await tester.wrapper.setProps({responseData:Buffer.from("1234")});
        expect(tester.wrapper.vm.preservedResponseData.length).toBe(2);

        // tester.wrapper.vm.startNewResponse();
        // await tester.wrapper.setProps({responseData:Buffer.from("EFGH")});
    })

    it('save response as testcase', async () => {
        // text
        let tester = new Tester({
            props : {
                directive : await MdbDirective.create({projectId:'TEST-PID-TEXT'}),
                responseData : Buffer.from('ABC'),
            }
        });
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'text';
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        let testcase = await MdbTestcase.findOne({project_id:'TEST-PID-TEXT'});
        expect(testcase).not.toBeNull();
        expect(testcase.expect.value).toBe('ABC');

        // hex
        tester = new Tester({
            props : {
                directive : await MdbDirective.create({projectId:'TEST-PID-HEX'}),
                responseData : Buffer.from('ABC'),
            }
        });
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'hex';
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        testcase = await MdbTestcase.findOne({project_id:'TEST-PID-HEX'});
        expect(testcase).not.toBeNull();
        expect(testcase.expect.value).toBe('414243');

        // form
        tester = new Tester({
            props : {
                directive : await MdbDirective.create({
                    projectId:'TEST-PID-FORM',
                    responseFormatter : JSON.stringify({fields : [{name:'F01',type:'string',length:'3'}]}),
                }),
                responseData : Buffer.from('ABC'),
            }
        });
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'form';
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        testcase = await MdbTestcase.findOne({project_id:'TEST-PID-FORM'});
        expect(testcase).not.toBeNull();
        expect(testcase.expect.value[0].comparator).toBe('Equal');
        expect(testcase.expect.value[0].length).toBe('3');
        expect(testcase.expect.value[0].value).toBe('ABC');

        let messageError = jest.fn(() => {});

        // empty response not available
        tester = new Tester({
            props : {responseData : Buffer.from('')}
        });
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'form';
        tester.wrapper.vm.$message.error = messageError;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        expect(messageError).toBeCalledTimes(1);
        expect(messageError.mock.calls[0][0]).toBe('No response available.');

        // response format not available
        tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'stream';
        tester.wrapper.vm.$message.error = messageError;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        expect(messageError).toBeCalledTimes(2);
        expect(messageError.mock.calls[1][0]).toBe('Current response handle does not support save as testcase.');

        // preserve mode not available
        tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'text';
        await tester.emit({ref:'switchPreserveMode'}, 'change', [true]);
        tester.wrapper.vm.$message.error = messageError;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsTestcase'});
        await tester.msleep(100);
        expect(messageError).toBeCalledTimes(3);
        expect(messageError.mock.calls[2][0]).toBe('Save as testcase not available under preserve mode.');
    }, 30000)
    
    it('save response as excel', async () => {
        let exportAsExcel = jest.fn(() => {});
        let messageInfo = jest.fn(()=>{});

        // basic export
        let tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'form';
        await tester.emit({ref:'switchPreserveMode'}, 'change', [true]);
        await tester.wrapper.setProps({responseData:Buffer.from("ABCD")});
        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.setProps({responseData:Buffer.from("EFGH")});
        tester.wrapper.vm.$refs.preserveViewer.exportAsExcel = exportAsExcel;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsExcel'});
        await tester.msleep(100);
        expect(exportAsExcel).toBeCalled();

        // viewer does not support exporting
        tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'hex';
        await tester.emit({ref:'switchPreserveMode'}, 'change', [true]);
        await tester.wrapper.setProps({responseData:Buffer.from("ABCD")});
        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.setProps({responseData:Buffer.from("EFGH")});
        tester.wrapper.vm.$message.info = messageInfo;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsExcel'});
        await tester.msleep(100);
        expect(messageInfo).toBeCalledTimes(1);
        expect(messageInfo.mock.calls[0][0]).toBe('Current response handle does not support excel export.');

        // stream viewer does not support exporting
        tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'stream';
        await tester.wrapper.setProps({responseData:Buffer.from("ABCD")});
        tester.wrapper.vm.$message.info = messageInfo;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsExcel'});
        await tester.msleep(100);
        expect(messageInfo).toBeCalledTimes(2);
        expect(messageInfo.mock.calls[1][0]).toBe('Current response handle does not support excel export.');

        // empty data does not support exporting
        tester = new Tester();
        await tester.setup();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'stream';
        await tester.wrapper.setProps({responseData:Buffer.from("")});
        tester.wrapper.vm.$message.info = messageInfo;
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsExcel'});
        await tester.msleep(100);
        expect(messageInfo).toBeCalledTimes(3);
        expect(messageInfo.mock.calls[2][0]).toBe('No response data, unable to create excel file.');
    })

    it('save response as file', async () => {
        let dialogShowSaveDialogSync = jest.fn();
        let fsWriteFile = jest.fn();
        let shellOpenPath = jest.fn();

        let setupWindowVariables = () => {
            window.path = require('path');
            window.remote = {
                shell : {openPath : shellOpenPath}
            };
            window.fs.promises = {writeFile : fsWriteFile}
            window.dialog = {showSaveDialogSync : dialogShowSaveDialogSync};
        };

        // preserve mode enable
        let tester = new Tester({
            props : {
                directive : await MdbDirective.create({name:'TEST-DIR'}),
            },
        });
        await tester.setup();
        setupWindowVariables();
        await tester.mount(Viewer, true);
        await tester.emit({ref:'switchPreserveMode'}, 'change', [true]);
        await tester.wrapper.setProps({responseData:Buffer.from("ABCD")});
        tester.wrapper.vm.startNewResponse();
        await tester.wrapper.setProps({responseData:Buffer.from("EFGH")});
        dialogShowSaveDialogSync.mockImplementationOnce(opt => `/fake/path/${opt.defaultPath}`);
        fsWriteFile.mockImplementationOnce((filepath,filedata) => {
            expect(filepath).toBe('/fake/path/TEST-DIR.bin');
            expect(filedata.toString()).toBe('ABCDEFGH');
            return Promise.resolve()
        });
        shellOpenPath.mockImplementationOnce((folderPath) => expect(folderPath).toBe('/fake/path'));
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsFile'});
        await tester.msleep(100);

        // preserve mode disable
        tester = new Tester({
            props : {
                directive : await MdbDirective.create({name:'TEST-DIR'}),
                responseData : Buffer.from('ABCD'),
            },
        });
        await tester.setup();
        setupWindowVariables();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'hex';
        dialogShowSaveDialogSync.mockImplementationOnce(opt => `/fake/path/${opt.defaultPath}`);
        fsWriteFile.mockImplementationOnce((filepath,filedata) => {
            expect(filepath).toBe('/fake/path/TEST-DIR.bin');
            expect(filedata.toString()).toBe('ABCD');
            return Promise.resolve()
        });
        shellOpenPath.mockImplementationOnce((folderPath) => expect(folderPath).toBe('/fake/path'));
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsFile'});
        await tester.msleep(100);

        // empty response data
        tester = new Tester({
            props : {responseData : Buffer.from('')},
        });
        await tester.setup();
        setupWindowVariables();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'hex';
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsFile'});
        await tester.msleep(100);
        expect(shellOpenPath).toBeCalledTimes(2);

        // user cancel folder selection
        tester = new Tester({
            props : {
                directive : await MdbDirective.create({name:'TEST-DIR'}),
                responseData : Buffer.from('ABCD')
            },
        });
        await tester.setup();
        setupWindowVariables();
        await tester.mount(Viewer, true);
        tester.wrapper.vm.responseFormat = 'hex';
        dialogShowSaveDialogSync.mockImplementationOnce(opt => undefined);
        tester.wrapper.vm.actionResponseMenuItemClick({key:'SaveAsFile'});
        await tester.msleep(100);
        expect(shellOpenPath).toBeCalledTimes(2);
    })
});