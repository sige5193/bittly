import Tester from '../../../../utils/test/UnitTester.js'
import TargetEditor from '../TargetEditor.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbRuntimeVariable from '../../../../models/MdbRuntimeVariable.js'
import MdbProject from '../../../../models/MdbProject.js';
import MockSerialport from '../serialport/__tests__/mocks/MockSerialport.js';
describe('@/src/modules/directive/communicators/TargetEditor.vue', () => {
    it('basic', async ( ) => {
        MockSerialport.setup();
        let directive = new MdbDirective();
        let executeHandler = jest.fn().mockResolvedValue(true);

        let tester = new Tester({
            props : {
                value : directive,
                sendExecutor : executeHandler,
            },
            listeners : {
                input : ( newValue ) => directive = newValue,
            }
        });
        await tester.setup();
        await tester.activeNewProject();
        tester.project.defaultTargetType = 'SerialPort';
        await tester.project.save();

        await tester.mount(TargetEditor);
        await tester.select({ref:'selectTargetType'},'Network');

        let target = tester.wrapper.findComponent({ref:'targetEditor'});
        expect(target.vm.$options.name).toBe('Network');
        expect(directive.target.type).toBe('Network');

        await tester.click({ref:'btnSend'});
        expect(executeHandler).toBeCalled();
    })

    it('auto send and stop manually', async () => {
        MockSerialport.setup();
        let executeHandler = jest.fn().mockReturnValue(true);
        let directive = new MdbDirective();
        directive.target.type = 'SerialPort';

        let tester = new Tester({
            props : {
                value : directive,
                sendExecutor : executeHandler,
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.trigger({ref:'btnSendMenuTrigger'},'click');
        await tester.emit({ref:'menuAutoSend'}, 'click', [{key:'AutoSend'}]);

        // uncheck the fixed time and input min ~ max time
        await tester.trigger({ref:'checkboxAutoSendTimeFixed'}, 'click');
        await tester.input({ref:'checkboxAutoSendTimeMin'}, '100');
        await tester.input({ref:'checkboxAutoSendTimeMax'}, '200');
        await tester.emit({ref:'modalAutoSend'},'ok'); // start auto send

        await tester.msleep(2000);
        await tester.click({ref:'btnSend'});
        expect(executeHandler.mock.calls.length).toBeGreaterThanOrEqual(5);
        expect(executeHandler.mock.calls.length).toBeLessThanOrEqual(20);
    }, 30000);

    it('auto send with random time', async () => {
        MockSerialport.setup();
        let executeHandler = jest.fn().mockReturnValue(true);
        let directive = new MdbDirective();
        directive.target.type = 'SerialPort';

        let tester = new Tester({
            props : {
                value : directive,
                sendExecutor : executeHandler,
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);

        await tester.trigger({ref:'btnSendMenuTrigger'},'click');
        await tester.emit({ref:'menuAutoSend'}, 'click', [{key:'AutoSend'}]);

        // uncheck the fixed time and input min ~ max time
        await tester.trigger({ref:'checkboxAutoSendTimeFixed'}, 'click');
        await tester.input({ref:'checkboxAutoSendTimeMin'}, '100');
        await tester.input({ref:'checkboxAutoSendTimeMax'}, '200');
        await tester.emit({ref:'modalAutoSend'},'ok');
        await tester.msleep(2000);
        tester.wrapper.destroy();
        expect(executeHandler.mock.calls.length).toBeGreaterThanOrEqual(5);
        expect(executeHandler.mock.calls.length).toBeLessThanOrEqual(20);
    }, 30000);

    it('auto send', async ( done ) => {
        MockSerialport.setup();
        let executeHandler = jest.fn().mockReturnValue(true);
        let directive = new MdbDirective();
        directive.target.type = 'SerialPort';

        let tester = new Tester({
            props : {
                value : directive,
                sendExecutor : executeHandler,
            },
            listeners : {
                'auto-send-finished' : () => {
                    expect(executeHandler).toBeCalledTimes(5)
                    done();
                }
            },
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.trigger({ref:'btnSendMenuTrigger'},'click');
        await tester.emit({ref:'menuAutoSend'}, 'click', [{key:'AutoSend'}]);
        await tester.input({ref:'inputIntervalTime'}, '100');
        await tester.trigger({ref:'checkboxExecuteAlways'}, 'click');
        await tester.input({ref:'inputExecuteCount'}, 5);
        await tester.emit({ref:'modalAutoSend'},'ok');
    }, 30000)

    it('auto send - stop executing if failed to execute', async ( done ) => {
        MockSerialport.setup();
        let directive = new MdbDirective();
        directive.target.type = 'SerialPort';

        let executeHandler = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false);
        let tester = new Tester({
            props : {
                value : directive,
                sendExecutor : executeHandler,
            },
            listeners : {
                'auto-send-finished' : () => {
                    expect(executeHandler).toBeCalledTimes(3)
                    done();
                }
            }
        });
        await tester.setup();
        await tester.mount(TargetEditor);
        await tester.trigger({ref:'btnSendMenuTrigger'},'click');
        await tester.emit({ref:'menuAutoSend'}, 'click', [{key:'AutoSend'}]);
        await tester.input({ref:'inputIntervalTime'}, '100');
        await tester.trigger({ref:'checkboxExecuteAlways'}, 'click');
        await tester.input({ref:'inputExecuteCount'}, 5);
        await tester.emit({ref:'modalAutoSend'},'ok');
    }, 30000)

    it('remember last target options', async () => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
            }
        });
        await tester.setup();
        await MdbRuntimeVariable.setVarValue('last_target_option', JSON.stringify({type:'Modbus'}));
        await tester.mount(TargetEditor);
        expect(tester.wrapper.vm.$data.target.type).toBe('Modbus');
    })

    it('remember project default target type', async () => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
            }
        });
        await tester.setup();

        let project = new MdbProject();
        project.name = 'DEMO';
        project.defaultTargetType = 'Network';
        await project.save();
        tester.activeProject(project);
        
        MdbRuntimeVariable.deleteAll({key:'last_target_option'});
        await tester.mount(TargetEditor);
        expect(tester.wrapper.vm.$data.target.type).toBe('Network');
    })

    it('default target type to serialport', async () => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
            }
        });
        await tester.setup();

        let project = new MdbProject();
        project.name = 'DEMO';
        project.defaultTargetType = '';
        await project.save();
        tester.activeProject(project);
        
        MdbRuntimeVariable.deleteAll({key:'last_target_option'});
        await tester.mount(TargetEditor);
        expect(tester.wrapper.vm.$data.target.type).toBe('SerialPort');
    })
});