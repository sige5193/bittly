import Tester from '../../../../utils/test/UnitTester.js';
import FolderSelect from '../FolderSelect.vue'
import MdbProject from '../../../../models/MdbProject.js';
import MdbDirectiveEntry from '../../../../models/MdbDirectiveEntry.js'
import { NIL as NIL_UUID } from 'uuid';
import MdbDirectiveFolder from '../../../../models/MdbDirectiveFolder.js';
describe('@/modules/directive/entry/FolderSelect.vue', () => {
    it('basic', async ( ) => {
        let tester = new Tester();
        await tester.setup();

        let projects = await MdbProject.findAll();
        tester.activeProject(projects[0]);
        let pid = projects[0].id;

        // create an entry without target
        await MdbDirectiveEntry.create({projectId:pid,type:'folder',parentId:NIL_UUID,target:NIL_UUID}, true);

        // sub items
        let f01 = await MdbDirectiveFolder.create({projectId:pid,name:'F-NAME'}, true);
        await MdbDirectiveEntry.create({projectId:pid,type:'folder',parentId:NIL_UUID,target:f01.id}, true);
        let f02 = await MdbDirectiveFolder.create({projectId:pid,name:'F-NAME-ANOTHER'}, true);
        await MdbDirectiveEntry.create({projectId:pid,type:'folder',parentId:NIL_UUID,target:f02.id}, true);
        
        let wrapper = await tester.mount(FolderSelect);
        await wrapper.vm.actionLoadData({
            dataRef : {},
            value : NIL_UUID,
        });
        
        let selectedEntryId = null;
        wrapper.vm.select().then(entryId => selectedEntryId = entryId);
        await tester.msleep(100);
        await tester.emit({ref:'treeDir'}, 'select', [[]]);
        await tester.emit({ref:'treeDir'}, 'select', [['0000']]);
        await tester.emit({ref:'modelSelect'}, 'ok');
        expect(selectedEntryId).toBe('0000');

        // returns null if user cancel selection.
        await wrapper.vm.actionLoadData({dataRef : {children:true}});
        wrapper.vm.select().then(entryId => selectedEntryId = entryId);
        await tester.msleep(100);
        await tester.emit({ref:'modelSelect'}, 'cancel');
        expect(selectedEntryId).toBeNull();
    })
});