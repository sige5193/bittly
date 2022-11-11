jest.mock('three', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/loaders/OBJLoader.js', ()=>{}, {virtual:true});
jest.mock('three/examples/jsm/controls/OrbitControls.js', ()=>{}, {virtual:true});
import MdbPanel from '../../../models/MdbPanel.js';
import Tester from '../../../utils/test/UnitTester.js'
import PanelEdit from '../PanelEdit.vue'
describe('@/modules/panel/PanelEdit.vue', () => {
    it('normal use', async () => {
        let panel = new MdbPanel();
        panel.widgets = [{
            name:"button",
            type:"trigger",
            label:"Button",
            pos:{"x":441,"y":148},
            btnSize:"default",
            btnType:"default",
            confirmMessage:"",
            inited:true,
            action:"directive"
        }];

        let switchModeToRun = jest.fn();
        let tester = new Tester({
            props : { value : new MdbPanel() },
            listeners : {'switch-mode-to-run' : switchModeToRun},
        });
        await tester.setup();
        await tester.mount(PanelEdit);
        let vm = tester.wrapper.vm;

        tester.wrapper.setProps({value:panel});
        await tester.msleep(100);

        // input name and save
        await tester.input({ref:'inputName'}, 'PANEL_001');
        await tester.click({ref:'btnSave'});
        await tester.msleep(200);
        expect(panel.name).toBe('PANEL_001');

        // drop a new widget
        vm.actionWidgetDragStart({dataTransfer:{setData:()=>{}}}, 1);
        await tester.msleep(100);
        await tester.trigger({ref:'editor'},'dragover',[{preventDefault:()=>{}}]);
        await tester.trigger({ref:'editor'},'drop',[{
            dataTransfer:{
                getData:(name)=>{return {action:'NewWidget',widgetIndex:0}[name];}
            }
        }]);
        await tester.msleep(500);
        expect(tester.wrapper.findAllComponents({ref:'widgets'}).length).toBe(2);
        vm.$refs.widgets[1].$refs.setting.actionSettingOk();
        await tester.msleep(200);

        // move it to 100,100
        vm.actionWidgetMoveDragStop(100, 100, 1);
        await vm.$nextTick();
        expect(panel.widgets[1].pos).toEqual({x:100,y:102});

        // resize it to 100x100, NOTE: button does not support resize, we just test action here.
        vm.actionWidgetResizeStop(100, 100, 200, 300, 1);
        await vm.$nextTick();
        expect(panel.widgets[1].sizeHeight).toBe(300);
        expect(panel.widgets[1].sizeWidth).toBe(200);

        // double click it to show setting modal
        vm.actionWidgetDoubleClick(null, 1);
        await tester.msleep(200);
        expect(vm.$refs.widgets[1].$refs.setting.enable).toBeTruthy();
        vm.$refs.widgets[1].$refs.setting.actionSettingOk();
        await tester.msleep(200);

        // context menu : setting
        vm.actionWidgetContextMenuItemClicked('Setting', 1);
        await tester.msleep(200);
        expect(vm.$refs.widgets[1].$refs.setting.enable).toBeTruthy();
        vm.$refs.widgets[1].$refs.setting.actionSettingOk();
        await tester.msleep(200);

        // context menu : move to front
        vm.actionWidgetContextMenuItemClicked('MoveToFront', 1);
        await tester.msleep(200);
        expect(panel.widgets[1].zindex).toBe(1);

        // context menu : move to back
        vm.actionWidgetContextMenuItemClicked('MoveToBack', 1);
        await tester.msleep(200);
        expect(panel.widgets[1].zindex).toBe(0);
        vm.actionWidgetContextMenuItemClicked('MoveToBack', 1);
        await tester.msleep(200);
        expect(panel.widgets[1].zindex).toBe(0);

        // context menu : delete
        vm.$confirm = jest.fn((opt) => opt.onOk());
        vm.actionWidgetContextMenuItemClicked('Delete', 1);
        await tester.msleep(200);
        expect(panel.widgets.length).toBe(1);

        // widget drawer
        await tester.click({ref:'btnToggleVariableDrawer'});
        expect(vm.variableDrawerEnable).toBeTruthy();

        // create new variable
        vm.$refs.variableEditor.actionVariableAdd = jest.fn();
        await tester.click({ref:'btnVariableAdd'});
        expect(vm.$refs.variableEditor.actionVariableAdd).toBeCalled();

        // switch to 'run' mode
        vm.$confirm = jest.fn((opt) => opt.onOk());
        vm.actionSwitchMode();
        await tester.msleep(500);
        expect(switchModeToRun).toBeCalled();
        
        // switch to 'run' mode ：no change
        vm.actionSwitchMode();
        await tester.msleep(500);
        expect(switchModeToRun).toBeCalledTimes(2);

        // switch to 'run' mode : change
        vm.isChanged = true;
        vm.$confirm.mockImplementationOnce((opt) => opt.onCancel());
        vm.actionSwitchMode();
        await tester.msleep(500);
        expect(switchModeToRun).toBeCalledTimes(3);
        
        // delete panel
        vm.$confirm = jest.fn((opt) => opt.onOk());
        await tester.click({ref:'btnDelete'});
        expect(await MdbPanel.findOne(panel.id)).toBeNull();
        
        // failed to save
        let badPanel = new MdbPanel();
        badPanel.save = () => Promise.resolve(false);
        vm.$message.error = jest.fn();
        tester.wrapper.setProps({value:badPanel});
        await tester.msleep(100);
        await tester.click({ref:'btnSave'});
        await tester.msleep(200);
        expect(vm.$message.error).toBeCalled();

        // destory
        tester.wrapper.destroy();
    }, 10000)
});