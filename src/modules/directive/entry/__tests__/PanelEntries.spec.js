import { NIL as NIL_UUID } from 'uuid';
import PanelEntries from '../PanelEntries.vue'
import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '../../../../models/MdbDirective.js'
import MdbDirectiveEntry from '../../../../models/MdbDirectiveEntry.js'
import MdbProject from '../../../../models/MdbProject';
import MdbDirectiveFolder from '../../../../models/MdbDirectiveFolder';
describe('@/src/modules/directive/entry/PanelEntries.vue', () => {
    /**
     * @var {Tester}
     */
    let tester = null;
    /**
     * @var {null|function}
     */
    let directiveClickedHandler = null;
    
    beforeEach(async () => {
        window.console.log = () => {};

        let inited = false;
        directiveClickedHandler = jest.fn(() => {});
        tester = new Tester({
            props : {
                projectId : '1',
            },
            listeners : {
                inited : () => inited = true,
                'directive-click' : directiveClickedHandler,
            },
        });
        await tester.setup();
        await tester.mount(PanelEntries);
        await tester.msleep(200);
        expect(inited).toBe(true);

        // load default project
        inited = false;
        let projects = await MdbProject.findAll();
        await tester.activeProject(projects[0]);

        tester.wrapper.setProps({projectId:projects[0].id});
        await tester.msleep(200);
        expect(inited).toBe(true);
    });

    it('basic', async () => {
        let pid = tester.project.id;
        let wrapper = tester.wrapper;

        // insert a bad entry which has no target
        await MdbDirectiveEntry.create({type:'folder',parentId:NIL_UUID,target:NIL_UUID,projectId:pid}, true);
        await wrapper.vm.loadMenuData();

        // append directive entry to the root
        let d01 = await MdbDirective.create({projectId:pid,name:'D01-NAME'}, true); 
        let e01 = await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:d01.id,projectId:pid}, true);
        wrapper.vm.appendEntry(e01, d01);
        await wrapper.vm.$nextTick();

        // append folder entry with one child
        let f01 = await MdbDirectiveFolder.create({name:'F01-NAME',projectId:pid}, true);
        let e02 = await MdbDirectiveEntry.create({type:'folder',parentId:NIL_UUID,target:f01.id,projectId:pid}, true);
        wrapper.vm.appendEntry(e02, f01);
        await wrapper.vm.$nextTick();
        let f01c01 = await MdbDirective.create({projectId:pid,name:'F01D01-NAME'}, true); 
        let e01c01 = await MdbDirectiveEntry.create({type:'directive',parentId:e02.id,target:f01c01.id,projectId:pid}, true);
        wrapper.vm.appendEntry(e01c01, f01c01);
        await wrapper.vm.$nextTick();

        // search 
        await tester.input({ref:'txtSearch'},'NAME');

        // click appended entry
        await tester.trigger(`#entry-item-${e01.id}`, 'click');
        expect(directiveClickedHandler.mock.calls[0][0].name).toBe(d01.name);
        
        // click folder item
        await tester.trigger(`#entry-item-${e02.id}`, 'click');
        await tester.trigger(`#entry-item-${e02.id}`, 'click');

        // get directive from entry
        expect(wrapper.vm.getDirectiveById('NOT-EXISTS')).toBeNull();

        // refresh entry
        d01.name = 'NEW-NAME';
        wrapper.vm.refreshDirective(d01);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.getDirectiveById(d01.id).name).toBe('NEW-NAME');
    })

    it('menu item drop', async() => {
        let vm = tester.wrapper.vm;
        let pid = tester.project.id;
        
        let directive = await MdbDirective.create({projectId:pid,name:'D01-NAME',description:'TEST-DESC-XXX'}, true); 
        let dirEntry = await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:directive.id,projectId:pid}, true);
        vm.appendEntry(dirEntry, directive);
        await vm.$nextTick();
        await tester.msleep(200);
        
        // drop to gap
        vm.actionMenuItemDrop({
            dropToGap:true,
            dragNode:{
                $vnode:{
                    data:{
                        props:{
                            value : dirEntry.id,
                        }
                    }
                }
            }
        });
        await tester.msleep(200);

        // drop to folder
        vm.actionMenuItemDrop({
            dropToGap:false,
            node : {
                $vnode : {
                    data : {
                        props : {
                            type : 'directive',
                            value : dirEntry.id,
                        }
                    }
                }
            },
        });
        await tester.msleep(200);

        // drop to folder
        vm.actionMenuItemDrop({
            dropToGap:false,
            node : {
                $vnode : {
                    data : {
                        props : {
                            type : 'folder',
                            value : dirEntry.id,
                        }
                    }
                }
            },
            dragNode:{
                $vnode:{
                    data:{
                        props:{
                            value : dirEntry.id,
                        }
                    }
                }
            }
        });
        await tester.msleep(200);
    });

    it('quick menu', async() => {
        let pid = tester.project.id;
        let vm = tester.wrapper.vm;
        
        // refreh
        vm.$message.success = jest.fn();
        await vm.actionHandleQuickMenuClick({key:'Refresh'});
        await tester.msleep(100);
        expect(vm.$message.success).toBeCalled();

        // new folder
        let folder = await MdbDirectiveFolder.create({name:'F01-NAME',projectId:pid}, true);
        let entry = await MdbDirectiveEntry.create({type:'folder',parentId:NIL_UUID,target:folder.id,projectId:pid}, true);
        vm.$refs.modalFolderEdit.create = jest.fn(() => Promise.resolve(entry));
        await vm.actionHandleQuickMenuClick({key:'NewFolder'});
        expect(vm.$refs.modalFolderEdit.create).toBeCalled();
        await tester.msleep(500);
    });

    it('entry item context menu', async () => {
        let pid = tester.project.id;
        let vm = tester.wrapper.vm;
        
        // en ~~~
        vm.actionEntryItemMenuIconClicked({
            stopPropagation(){},
            currentTarget : {
                parentElement : {
                    parentElement : {
                        parentElement : {
                           dispatchEvent(){},
                        },
                    }
                },
            }
        });

        // new folder
        let folder = await MdbDirectiveFolder.create({name:'F01-NAME',projectId:pid}, true);
        let entry = await MdbDirectiveEntry.create({type:'folder',parentId:NIL_UUID,target:folder.id,projectId:pid}, true);
        vm.appendEntry(entry, folder);
        await vm.$nextTick();
        vm.$refs.modalFolderEdit.create = jest.fn(() => Promise.resolve(entry));
        await vm.actionMenuItemContextMenuClick(entry.id, 'FolderNewSubFolder');
        expect(vm.$refs.modalFolderEdit.create).toBeCalled();
        await tester.msleep(200);

        // Folder Rename
        vm.$refs.modalFolderEdit.update = jest.fn(() => Promise.resolve());
        await vm.actionMenuItemContextMenuClick(entry.id, 'FolderRename');
        expect(vm.$refs.modalFolderEdit.update).toBeCalled();
        await tester.msleep(200);

        // FolderDelete
        vm.$confirm = jest.fn((opt) => opt.onCancel());
        await vm.actionMenuItemContextMenuClick(entry.id, 'FolderDelete');
        await tester.msleep(200);
        expect(await MdbDirectiveEntry.findOne(entry.id)).not.toBeNull();
        vm.$confirm = jest.fn((opt) => opt.onOk());
        await vm.actionMenuItemContextMenuClick(entry.id, 'FolderDelete');
        await tester.msleep(200);
        expect(await MdbDirectiveEntry.findOne(entry.id)).toBeNull();

        // DirectiveCopy
        let directive = await MdbDirective.create({projectId:pid,name:'D01-NAME',description:'TEST-DESC-XXX'}, true); 
        let dirEntry = await MdbDirectiveEntry.create({type:'directive',parentId:NIL_UUID,target:directive.id,projectId:pid}, true);
        vm.appendEntry(dirEntry, directive);
        await tester.msleep(200);
        await vm.$nextTick();
        await vm.actionMenuItemContextMenuClick(dirEntry.id, 'DirectiveCopy');
        await tester.msleep(200);
        expect((await MdbDirective.findAll({description:'TEST-DESC-XXX'})).length).toBe(2);

        // DirectiveDelete
        vm.$confirm = jest.fn((opt) => opt.onCancel());
        await vm.actionMenuItemContextMenuClick(dirEntry.id, 'DirectiveDelete');
        expect(await MdbDirectiveEntry.findOne(dirEntry.id)).not.toBeNull();
        vm.$confirm = jest.fn((opt) => opt.onOk());
        await vm.actionMenuItemContextMenuClick(dirEntry.id, 'DirectiveDelete');
        await tester.msleep(200);
        expect(await MdbDirectiveEntry.findOne(dirEntry.id)).toBeNull();
    })
});