import MdbDirective from '../../../models/MdbDirective.js';
import MdbRuntimeVariable from '../../../models/MdbRuntimeVariable.js'
import Tester from '../../../utils/test/UnitTester.js'
import Main from '../Main.vue'
import MdbProject from '../../../models/MdbProject.js';
import MockSerialport from '../communicators/serialport/__tests__/mocks/MockSerialport.js';
import StorageSqlite from '../../../utils/database/StorageSqlite.js';
describe('@/src/modules/directive/Main.vue', () => {
    let setupTester = async () => {
        let tester = new Tester({
            stubs : {
                'panel-directive' : {
                    template : '<div></div>',
                    methods : {}
                },
                'panel-entries' : {
                    template : '<div></div>',
                    mounted() {
                        let $this = this;
                        setTimeout(() => $this.$emit('inited'), 500);
                    },
                    methods : {
                        async getDirectiveById(id) {
                            return await MdbDirective.findOne(id);
                        },
                    }
                }
            },
        });
        await tester.setup();
        return tester;
    };
    
    beforeEach(() => {
        window.ipcRenderer = {};
        window.ipcRenderer.send = () => {};
        MockSerialport.setup();
    });

    /**
     * trigger directive tab context menu item
     * @param {*} tester 
     * @param {*} key 
     * @param {*} index 
     */
    let triggerDirectiveTabContextMenuItem = async ( tester, key, dataset) => {
        let oldConsoleWarning = window.console.warn;
        window.console.warn = () => {};

        let trigger = tester.wrapper.find({ref:'dropdownDirectiveTabTitle'});
        trigger.element.dispatchEvent(new MouseEvent('contextmenu',{
            clientX : 0,
            clientY : 0,
        }));
        await tester.msleep(200);

        let menu = tester.wrapper.findComponent({ref:'menuDirectiveTabTitle'});
        await menu.vm.$emit('click',{key:key,domEvent:{target:{dataset}}});
        await tester.msleep(200);
        
        window.console.warn = oldConsoleWarning;
    };
    
    it('open the directives last opened', async( done ) => {
        let tester = await setupTester();
        tester.on('ready', async() => {
            expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
            let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
            expect(tabTitle).toBe(directives[0].name);

            await tester.emit({ref:'entries'},'directive-click',[directives[1]]);
            expect(tester.count({ref:'directiveTabPanel'})).toBe(2);

            await tester.emit({ref:'entries'},'directive-click',[directives[0]]);
            expect(tester.count({ref:'directiveTabPanel'})).toBe(2);

            await tester.emit({ref:'entries'},'directive-click',[null]);
            expect(tester.count({ref:'directiveTabPanel'})).toBe(2);

            tester.wrapper.destroy();
            done();
        })
        let project = await MdbProject.findOne({});
        tester.activeProject(project);

        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
    });
/*
    it('no memorized directives', async() => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');
    });
  
    it('directive tab remove', async() => {
        let tester = new Tester();
        await tester.setup();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);

        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);

        await tester.mount(Main);
        console.log(StorageSqlite.getDatabase().testid);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        // after directive closed, a new directive would be created
        let directiveTabKey = tester.dataGet('openedDirectives')[0].key;
        await tester.emit({ref:'directive-tab'},'edit',[directiveTabKey,'remove']);
        await tester.msleep(200);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        // nothing happend if key does not exists.
        await tester.emit({ref:'directive-tab'},'edit',['not-exists','remove']);
        await tester.msleep(200);

        let directiveChangeSaveConfirm = jest.fn();
        tester.wrapper.vm.$confirm = directiveChangeSaveConfirm;
        // open another directive and modify it, then close it to test confirmtion witout save it.
        tester.wrapper.vm.directiveTabAdd(directives[1].getData());
        await tester.msleep(500);
        directiveTabKey = tester.dataGet('activedDirectiveTab');
        await tester.emit({ref:'directive-tab'},'edit',[directiveTabKey,'remove']);
        await tester.msleep(200);
        await directiveChangeSaveConfirm.mock.calls[0][0].onCancel();
        await tester.msleep(200);

        // open another directive and modify it, then close it to test confirmtion and save it.
        await tester.emit({ref:'entries'},'directive-click',[directives[1]]);
        await tester.msleep(200);
        directives[1].name = 'NEW-NAMEyyyy'; // change the directive
        await tester.msleep(200);
        directiveTabKey = tester.dataGet('activedDirectiveTab');
        await tester.emit({ref:'directive-tab'},'edit',[directiveTabKey,'remove']);
        await tester.msleep(200);
        await directiveChangeSaveConfirm.mock.calls[1][0].onOk();
        await tester.msleep(200);

        // open another directive and modify it, then close it to test confirmtion witout save it.
        tester.wrapper.vm.directiveTabAdd(directives[1].getData());
        await tester.msleep(500);
        directiveTabKey = tester.dataGet('activedDirectiveTab');
        await tester.emit({ref:'directive-tab'},'edit',[directiveTabKey,'remove']);
        await tester.msleep(200);
        let directiveIndex = tester.wrapper.vm.getDirectiveIndexByTabKey(directiveTabKey);
        tester.wrapper.vm.$refs[`directivePanel_${directiveIndex}`][0].save = () => Promise.resolve(false);
        await directiveChangeSaveConfirm.mock.calls[2][0].onOk();
        await tester.msleep(200);

        // close the first one, the second would be actived
        tester.wrapper.vm.activedDirectiveTab = tester.dataGet('openedDirectives')[0].key;
        await tester.msleep(200);
        let secondDirectiveTabKey = tester.dataGet('openedDirectives')[1].key;
        await tester.wrapper.vm.directiveTabClose(0);
        await tester.msleep(200);
        expect(tester.dataGet('activedDirectiveTab')).toBe(secondDirectiveTabKey);
    }, 30000);

    it('directive tab add', async() => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);

        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);

        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        // tab add would create a new directive with default title
        await tester.emit({ref:'directive-tab'},'edit',[null,'add']);
        await tester.msleep(200);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(1).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');
    });

    it('auto close tab while directive deleted', async() => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);

        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);

        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        await directives[0].delete();
        await tester.msleep(200);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');
    });

    it('debug new directive saved', async( done ) => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        
        await tester.mount(Main);
        console.log(StorageSqlite.getDatabase().testid);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        let directivePanel = tester.wrapper.findAllComponents({ref:'directivePanel_0'}).at(0);
        tester.wrapper.vm.$refs.entries.appendEntry = jest.fn();
        directivePanel.vm.$emit('directive-saved', true, {id:'test'}, null);
        await tester.msleep(200);
        expect(tester.wrapper.vm.$refs.entries.appendEntry).toBeCalled();
        let directiveActivedId = await MdbRuntimeVariable.getVarValue('directive_actived_id');
        expect(directiveActivedId).toBe('test');
        done();
    }, 50000);

    it('open directive from bittly://', async() => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        await tester.mount(Main);
        await tester.msleep(2000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await tester.eventBusEmit('directive-new-temp-create', directives[0].getData());
        await tester.msleep(200);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(1).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);
    }, 10000);

    it('directive tab more list', async() => {
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        await tester.trigger('.tab-ext-tools-more-list', 'click');
        await tester.msleep(1000);
        await tester.emit({ref:'menuTabExtToolsMoreList'}, 'click', [{key:'test'}]);
        expect(tester.dataGet('activedDirectiveTab')).toBe('test');
    });

    it('directive tab context menu : CreateNew', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        await tester.msleep(1000);
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        await triggerDirectiveTabContextMenuItem(tester, 'CreateNew', {index:0});
        expect(tester.count({ref:'directiveTabPanel'})).toBe(2);
    });

    it('directive tab context menu : DuplicateThis', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        await MdbRuntimeVariable.deleteAll({key:'directive_opened_list'});
        await MdbRuntimeVariable.deleteAll({key:'directive_actived_id'});
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');

        await triggerDirectiveTabContextMenuItem(tester, 'DuplicateThis', {index:0});
        expect(tester.count({ref:'directiveTabPanel'})).toBe(2);
    });

    it('directive tab context menu : CopyName', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);
        
        let clipboardWriteText = jest.fn();
        window.navigator.clipboard = { writeText : clipboardWriteText };
        await triggerDirectiveTabContextMenuItem(tester, 'CopyName', {index:0});
        expect(clipboardWriteText.mock.calls[0][0]).toBe(directives[0].name);
    });

    it('directive tab context menu : CopyPathName', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        let clipboardWriteText = jest.fn();
        window.navigator.clipboard = { writeText : clipboardWriteText };
        await triggerDirectiveTabContextMenuItem(tester, 'CopyPathName', {index:0});
        expect(clipboardWriteText.mock.calls[0][0]).toBe("通讯演示/" + directives[0].name);
    });

    it('directive tab context menu : CloseThis', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);
        
        await triggerDirectiveTabContextMenuItem(tester, 'CloseThis', {dirkey:tester.dataGet('activedDirectiveTab')});
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');
    });

    it('directive tab context menu : CloseOthers', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        await tester.emit({ref:'entries'},'directive-click',[directives[1]]);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(2);

        await tester.emit({ref:'entries'},'directive-click',[directives[2]]);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(3);
        
        await triggerDirectiveTabContextMenuItem(tester, 'CloseOthers', {dirkey:tester.dataGet('activedDirectiveTab')});
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[2].name);
    });

    it('directive tab context menu : CloseAll', async() => {
        window.console.error = () => {};
        let tester = await setupTester();
        
        let project = await MdbProject.findOne({});
        tester.activeProject(project);
        let directives = await MdbDirective.findAll({project_id:tester.project.id});
        await MdbRuntimeVariable.setVarValue('directive_opened_list', directives[0].id, tester.project.id);
        await MdbRuntimeVariable.setVarValue('directive_actived_id', directives[0].id, tester.project.id);
        await tester.mount(Main);
        await tester.msleep(1000);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        let tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe(directives[0].name);

        await tester.emit({ref:'entries'},'directive-click',[directives[1]]);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(2);

        await tester.emit({ref:'entries'},'directive-click',[directives[2]]);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(3);
        
        await triggerDirectiveTabContextMenuItem(tester, 'CloseAll', {});
        await tester.msleep(500);
        expect(tester.count({ref:'directiveTabPanel'})).toBe(1);
        tabTitle = tester.wrapper.findAllComponents({ref:'directiveTabPanel'}).at(0).vm.$slots.tab[0].elm.textContent.trim();
        expect(tabTitle).toBe('Untitled');
    });

    */
});