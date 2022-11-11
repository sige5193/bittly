import Tester from '../../../../../utils/test/UnitTester.js'
import Runtime from '../../../Runtime.js'
import Run from '../Run.vue'
describe('@/modules/panel/widgets/button/Run.vue', () => {
    let panel = null;
    let runtime = null;
    
    beforeEach(() => {
        panel = {
            variables : [
                {name:'TESTVAR001',type:'string'}
            ],
        };
        runtime = new Runtime(panel, {
            refresh : function() {},
            $refs : { widgets:[] },
        });
    });

    it('basic', async () => {
        let widget = {
            label : 'TEST',
            icon : 'login',
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();

        let wrapper = await tester.mount(Run);
        expect(wrapper.text()).toBe('TEST');
        expect(wrapper.findComponent({ref:'icon'}).exists()).toBeTruthy();
    })

    it('no icon', async () => {
        let widget = {
            label : 'TEST',
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();

        let wrapper = await tester.mount(Run);
        expect(wrapper.text()).toBe('TEST');
        expect(wrapper.findComponent({ref:'icon'}).exists()).toBeFalsy();
    })

    it('execute script', async () => {
        let widget = {
            label : 'TEST',
            action : 'script',
            actionScript : 'bittly.variableSet("TESTVAR001","VALUE")',
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        await tester.activeNewProject();

        let wrapper = await tester.mount(Run);
        let button = wrapper.findComponent({ref:'button'});
        await button.trigger('click');
        expect(runtime.getVariableValue('TESTVAR001')).toBe('VALUE');
    })

    it('confirm-message', async () => {
        let widget = {
            label : 'TEST',
            action : 'script',
            actionScript : 'bittly.variableSet("TESTVAR001","VALUE")',
            confirmMessage : 'CONFIRM',
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        await tester.activeNewProject();

        let wrapper = await tester.mount(Run);
        wrapper.vm.$confirm = jest.fn(opt => opt.onOk());

        let button = wrapper.findComponent({ref:'button'});
        await button.trigger('click');
        expect(wrapper.vm.$confirm).toBeCalled();
        await tester.msleep(100);
        expect(runtime.getVariableValue('TESTVAR001')).toBe('VALUE');
    })

    it('attribute : size', async () => {
        let widget = {
            label : 'TEST',
            action : 'script',
            actionScript : 'bittly.variableSet("TESTVAR001","VALUE")',
            btnSize : 'small'
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        await tester.activeNewProject();

        let wrapper = await tester.mount(Run);
        let button = wrapper.findComponent({ref:'button'});
        expect(button.props('size')).toBe('small');
    })

    it('attribute : btnType', async () => {
        let widget = {
            label : 'TEST',
            action : 'script',
            actionScript : 'bittly.variableSet("TESTVAR001","VALUE")',
            btnType : 'primary'
        };

        let tester = new Tester({props:{widget,panel,runtime}});
        await tester.setup();
        await tester.activeNewProject();

        let wrapper = await tester.mount(Run);
        let button = wrapper.findComponent({ref:'button'});
        expect(button.props('type')).toBe('primary');
    })
});