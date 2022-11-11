import MdbPanel from "../../../models/MdbPanel";
import UnitTester from "../../../utils/test/UnitTester";
import Runtime from "../Runtime.js";
export default class WidgetTestHelper {
    /**
     * @returns Promise<{panel:MdbPanel;widget:{};tester:UnitTester;}>
     */
    static async setupEnvForEdit() {
        let env = {};
        env.panel = new MdbPanel();
        env.widget = {};
        env.tester = new UnitTester({
            props : {
                value : env.widget,
                panel : env.panel,
            },
            listeners : {
                input : newValue => env.widget = newValue,
            }
        });
        env.settingStart = async () => {
            env.tester.wrapper.vm.setting();
            await env.tester.msleep(100);
        };
        env.settingOk = async () => {
            env.tester.wrapper.vm.$refs.setting.actionSettingOk();
            await env.tester.msleep(100);
        }

        await env.tester.setup();
        return env;
    }

    /**
     * @param {*} widget 
     * @returns 
     */
    static async setupEnvForRunning( widget ) {
        let comMock = {};
        comMock.refresh = () => {};
        comMock.$refs = {widgets:[]};

        let env = {};
        env.widget = widget;
        env.panel = new MdbPanel();
        env.panel.variables = [{name:"VAR01",defaultValue:"0"}];
        env.runtime = new Runtime(env.panel, comMock);
        env.runtime.setVariableValue('VAR01', '33');
        env.tester = new UnitTester({
            props : {
                widget:env.widget,
                panel:env.panel,
                runtime:env.runtime,
            }
        });
        env.widgetRefresh = async () => {
            await env.tester.wrapper.vm.refresh();
            await env.tester.wrapper.vm.$nextTick();
        }
        await env.tester.setup();
        window.console.log = () => {};
        return env;
    }
}