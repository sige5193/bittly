import Tester from '../../../../utils/test/UnitTester.js';
import FolderEdit from '../FolderEdit.vue'
import MdbDirectiveFolder from '../../../../models/MdbDirectiveFolder.js'
describe('@/modules/directive/entry/PanelEntries.vue', () => {
    it('create folder', async ( done ) => {
        let tester = new Tester();
        await tester.setup();

        let wrapper = await tester.mount(FolderEdit);
        wrapper.vm.create('0000').then(async ( entry ) => {
            let folder = await entry.getTargetModel();
            expect(folder.name).toBe('FOLDER-001');
            expect(entry.parentId).toBe('0000');
            done();
        });
        await tester.msleep(100);
        await tester.input({ref:'inputName'}, 'FOLDER-001');
        await tester.emit({ref:'modalEditor'}, 'ok');
    })

    it('update folder', async ( done ) => {
        let tester = new Tester();
        await tester.setup();

        let wrapper = await tester.mount(FolderEdit);
        let folder = new MdbDirectiveFolder();
        wrapper.vm.update(folder).then(async ( entry ) => {
            expect(folder.name).toBe('FOLDER-001');
            done();
        });
        await tester.msleep(100);
        await tester.input({ref:'inputName'}, 'FOLDER-001');
        await tester.emit({ref:'modalEditor'}, 'ok');
    })

    it('cancel edit', async ( ) => {
        let tester = new Tester();
        await tester.setup();

        let wrapper = await tester.mount(FolderEdit);
        let userCancelHandler = jest.fn();
        wrapper.vm.create('0000')
            .then(async ( entry ) => {})
            .catch(userCancelHandler);
        await tester.msleep(100);
        await tester.emit({ref:'modalEditor'}, 'cancel');
        await tester.msleep(100);
        expect(userCancelHandler).toBeCalled();
    })
});