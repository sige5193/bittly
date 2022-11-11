import TestCaseSetup from '../../../utils/test/Setup.js';
import Testcase from '../Testcase.vue'
import MdbDirective from '@/models/MdbDirective.js'
import MdbTestcase from '../../../models/MdbTestcase.js';
describe('@/src/modules/test/Testcase.vue', () => {
    it('normal use', async () => {
        window.testFunc1 = jest.fn();
        window.testFunc2 = jest.fn();

        let directive = new MdbDirective();
        let testcase = new MdbTestcase();
        let setup = new TestCaseSetup();
        setup.componentSetProp('directive', directive);
        setup.componentSetProp('testcase', testcase);
        await setup.setup();

        // serialport mock
        window.SerialPort = class {
            constructor() {
                this.isOpen = true;
                this.eventHandlers = {};
            }
            on( name, callback ) {
                this.eventHandlers[name] = callback;
            }
            getIsOpen() {
                return true;
            }
            write(data, callback) {
                let $this = this;
                setTimeout(() => {
                    $this.eventHandlers.data(data);
                }, 100);
                callback();
            }
        };

        // setup directive
        let project = await setup.setActiveProject('new');
        directive.projectId = project.id;
        directive.name = 'D001';
        directive.target = {type:"SerialPort",path:"COM4",baudRate:"115200",dataBits:"8",stopBits:"1",parity:"none"};
        directive.requestFormat = 'text';
        directive.requestContent = {text:'AA{{value}}BB{{panel.RTV001}}CC'};
        directive.responseFormatter = {
            fields:[{
                key:1657341271981,
                name:"FirstChar",
                type:"char",
                length:1,
                desc:""
            },{
                key:1657341275882,
                name:"OtherChars",
                type:"string",
                length:15,
                desc:""
            }]
        };
        await directive.save();

        // setup testcase
        testcase.title = 'TESTCASE-001';
        testcase.paramFormat = 'text';
        testcase.params = {value:'how are you ?'};
        testcase.expectFormat = 'text';
        testcase.expect = {value:'how are you ?'};
        testcase.beforeScript = 'window.testFunc1("before-script");';
        testcase.timeout = 100;
        testcase.afterScript = 'window.testFunc2("after-script");';

        // mount and execute
        let wrapper = await setup.mount(Testcase);
        await setup.msleep(1000);
        await setup.comButtonClick(wrapper,'btnExecute');
        await setup.msleep(2000);

        expect(window.testFunc1).toBeCalled();
        expect(window.testFunc1).toBeCalledWith('before-script');

        expect(wrapper.vm.getResult()).toBe('how are you ?');
        expect(wrapper.vm.getResultStatus()).toBe('success');

        expect(window.testFunc2).toBeCalled();
        expect(window.testFunc2).toBeCalledWith('after-script');
    })
});