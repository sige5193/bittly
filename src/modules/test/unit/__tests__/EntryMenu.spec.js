import UnitTester from '../../../../utils/test/UnitTester.js';
import EntryMenu from '../EntryMenu.vue'
import MdbDirective from '../../../../models/MdbDirective.js'
import MdbDirectiveEntry from '../../../../models/MdbDirectiveEntry.js'
import MdbDirectiveFolder from '../../../../models/MdbDirectiveFolder';
import { NIL as NIL_UUID } from 'uuid';
describe('@/src/modules/test/unit/EntryMenu.vue', () => {
    it('basic', async () => {
        let workspaceOpenDirective = jest.fn();
        let getWorkspace = jest.fn(() => {
            return {
                openDirective : workspaceOpenDirective
            };
        });

        let tester = new UnitTester({
            props : {getWorkspace : getWorkspace},
        });
        await tester.setup();
        let project = await tester.activeNewProject();
        
        // append directive entry to the root
        let d01 = await MdbDirective.create({projectId:project.id,name:'D01-NAME'}, true); 
        let e01 = await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:d01.id,projectId:project.id}, true);
        
        // append directive entry to the root
        let d02 = await MdbDirective.create({projectId:project.id,name:'D02-NAME'}, true); 
        await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:d02.id,projectId:project.id}, true);

        // append folder entry with one child
        let f01 = await MdbDirectiveFolder.create({name:'F01-NAME',projectId:project.id}, true);
        let ef01 = await MdbDirectiveEntry.create({type:'folder',parentId:NIL_UUID,target:f01.id,projectId:project.id}, true);

        // append directive entry to the folder
        let d03 = await MdbDirective.create({projectId:project.id,name:'D03-NAME'}, true); 
        await MdbDirectiveEntry.create({type:'directive',parentId:ef01.id,target:d03.id,projectId:project.id}, true);

        await tester.mount(EntryMenu);
        
        // search 
        await tester.input({ref:'txtSearch'},'D01-NAME');
        expect(tester.wrapper.vm.menuData.length).toBe(1);
        expect(tester.wrapper.vm.menuData[0].title).toBe('D01-NAME');
        
        // search folder
        await tester.input({ref:'txtSearch'},'D03-NAME');
        expect(tester.wrapper.vm.menuData[0].children[0].title).toBe('D03-NAME');

        // select item
        await tester.emit({ref:'entryTree'}, 'select', [null,{node:{value:e01.id}}]);
        expect(workspaceOpenDirective).toBeCalled();
        expect(workspaceOpenDirective.mock.calls.at(-1)[0].id).toBe(d01.id);
        
        // click folder 
        await tester.emit({ref:'entryTree'}, 'select', [null,{node:{value:ef01.id}}]);
        expect(tester.wrapper.vm.menuExpandedKeys.indexOf(ef01.id)).toBe(0);
        await tester.emit({ref:'entryTree'}, 'select', [null,{node:{value:ef01.id}}]);
        expect(tester.wrapper.vm.menuExpandedKeys.indexOf(ef01.id)).toBe(-1);
        
        // quick menu : execute all
        let executeAllOpen = jest.fn();
        tester.wrapper.vm.$refs.executeAll.open = executeAllOpen;
        tester.wrapper.vm.actionHandleQuickMenuClick({key:'ExecuteAllTestcases'});
        expect(executeAllOpen).toBeCalled();
    })
});