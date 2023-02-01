import Tester from '../../../../utils/test/UnitTester.js'
import MdbDirective from '../../../../models/MdbDirective.js';
import WidgetRunMixin from '../WidgetRunMixin.js';
import MockSerialport from '../../../directive/communicators/serialport/__tests__/mocks/MockSerialport.js';
describe('@/src/modules/panel/widgets/WidgetRunMixin.js', () => {
    /**
     * mock runtime
     * @property {Object}
     */
    let runtime = {};
    /**
     * mock component
     * @property {Object}
     */
    let component = {};
    /**
     * 
     */
    beforeEach(() => {
        runtime = {
            variables : {RTV001:'RTV001'},
            getVariableValue( name ) {
                return this.variables[name];
            },
            setVariableValue( name, value ) {
                this.variables[name] = value;
            },
            requestLogPush() {},
            refresh() {},
            addVariableWatcher : jest.fn(),
        };

        component = {
            name : 'TESTCOM',
            mixins : [WidgetRunMixin],
            template : '<div></div>',
            methods : {
                valueGet() {
                    return 'COM-VALUE';
                }
            }
        };
    });
    
    it('execute directive & set full response to variable', async () => {
        let serialport = MockSerialport.setup();
        let widget = {
            action : 'directive',
        };
        let tester = new Tester({props:{widget,runtime}});
        await tester.setup();

        let wrapper = await tester.mount(component);
        let errorShow = jest.fn();
        wrapper.vm.$error = errorShow;

        // directive id not set
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(errorShow.mock.calls.at(-1)[0].content).toBe('Failed to execute widget action : this widget has no directive binded.');

        // directive id not exists
        widget.directiveId = 'XYZ';
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(errorShow.mock.calls.at(-1)[0].content).toBe('Failed to execute widget action : the directive binded to this widget is not available.');

        let project = await tester.activeNewProject();
        // directive exists
        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.name = 'D002';
        directive.target = {type:"SerialPort",path:"COM4",baudRate:"115200",dataBits:"8",stopBits:"1",parity:"none"};
        if ( ! await directive.save() ) {
            throw JSON.stringify(directive.errors);
        }
        widget.action = 'directive';
        widget.directiveId = directive.id;
        widget.directiveParamFormat = 'text';
        widget.directiveParams = 'AA{{value}}BB{{panel.RTV001}}CC{{panel.NOT-EXISTS}}';
        widget.directiveResponseParser = 'raw';
        widget.directiveResponseVariable = 'FullResponse';
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(errorShow.mock.calls.at(-1)[0].content).toBe('Failed to execute widget action : Variable "NOT-EXISTS" does not exists');

        // all ok
        widget.directiveParams = 'AA{{value}}BB{{panel.RTV001}}CC';
        await wrapper.vm.actionExecute();
        await tester.msleep(500);
        expect(runtime.variables.FullResponse.toString()).toBe('AACOM-VALUEBBRTV001CC');

        // response again
        serialport.response(Buffer.from("ABC"));
        await tester.msleep(100);
        expect(runtime.variables.FullResponse.toString()).toBe('AACOM-VALUEBBRTV001CCABC');
    });

    it('execute directive & parse response as form', async () => {
        MockSerialport.setup();
        
        let widget = {};
        let tester = new Tester({props:{widget,runtime}});
        await tester.setup();

        let project = await tester.activeNewProject();
        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.name = 'D001';
        directive.target = {type:"SerialPort",path:"COM4",baudRate:"115200",dataBits:"8",stopBits:"1",parity:"none"};
        directive.responseFormatter = {
            fields:[
                {name:"FirstChar",type:"char",},
                {name:"OtherChars",type:"string",length:5}
            ]
        };
        await directive.save();

        widget.action = 'directive';
        widget.directiveId = directive.id;
        widget.directiveParamFormat = 'form'
        widget.directiveParams = [
            {type:"string",value:"B"},
            {type:"string",value:"B{{panel.RTV001}}"}
        ];
        widget.directiveResponseParser = 'form';
        widget.directiveResponseMap = [
            {variable:'FirstChar'},
            {variable:'OtherChars'},
            {variable:null}
        ];

        let wrapper = await tester.mount(component);
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(runtime.variables.FirstChar).toBe('B');
        expect(runtime.variables.OtherChars).toBe('BRTV0');
    });

    it('execute directive & parse response as json', async () => {
        MockSerialport.setup();
        let widget = {};

        let tester = new Tester({props:{runtime,widget}});
        await tester.setup();

        let project = await tester.activeNewProject();
        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.name = 'D001';
        directive.target = {type:"SerialPort",path:"COM4",baudRate:"115200",dataBits:"8",stopBits:"1",parity:"none"};
        await directive.save();

        widget.action = 'directive';
        widget.directiveId = directive.id;
        widget.directiveParamFormat = 'text';
        widget.directiveParams = '{"data":{"user":{"name":"sige"}}}';
        widget.options = [{name:'OPT01',value:'01'}];
        widget.directiveResponseParser = 'json';
        widget.directiveResponseJsonMap = [
            {expression:'data.user.name',variable:'UserName'},
            {expression:'data.user.notExists',variable:'NotExists'},
        ];

        let wrapper = await tester.mount(component);
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(runtime.variables.UserName).toBe('sige');

        // bad json content
        runtime.variables = {};
        widget.directiveParams = '{"data":{"user":{"name":"sige"';
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(runtime.variables).toEqual({});
    });

    it('execute script', async () => {
        let widget = {};
        let tester = new Tester({props:{widget,runtime}});
        await tester.setup();

        await tester.activeNewProject();
        widget.action = 'script';
        widget.actionScript = 'bittly.variableSet("vname","v001");';
        
        let wrapper = await tester.mount(component);
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(runtime.variables.vname).toBe('v001');

        // bad script
        let errorShow = jest.fn();
        wrapper.vm.$error = errorShow;
        widget.actionScript = 'function(';
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(errorShow.mock.calls.at(-1)[0].content).toBe('Failed to execute widget action : Function statements require a function name');
    });

    it('execute variable', async () => {
        let widget = {};
        let tester = new Tester({props:{widget,runtime}});
        await tester.setup();

        widget.action = 'variable';
        widget.targetVariable = 'TV001';

        component.methods = {
            valueGet () {
                return 'CV001';
            }
        }
        let wrapper = await tester.mount(component);
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(runtime.variables.TV001).toBe('CV001');
    })

    it('basic', async() => {
        let widget = {};
        let tester = new Tester({props:{widget,runtime}});
        await tester.setup();

        delete component.methods.valueGet;
        widget.action = 'not-support';
        let wrapper = await tester.mount(component);
        let errorShow = jest.fn();
        wrapper.vm.$error = errorShow;
        await wrapper.vm.actionExecute();
        await tester.msleep(100);
        expect(errorShow.mock.calls.at(-1)[0].content).toBe('this widget has no action.');

        wrapper.vm.refresh();
        wrapper.vm.valueGet();
        
        // not work
        wrapper.vm.addVariableWatcher(null, ()=>{});
        // works
        let watcher = jest.fn();
        wrapper.vm.addVariableWatcher('TV001', watcher);
        expect(runtime.addVariableWatcher.mock.calls.at(-1)[1]).toBe(watcher);
    })
});