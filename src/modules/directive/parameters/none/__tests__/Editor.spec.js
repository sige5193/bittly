import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/none/Editor.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
            },
            listeners : {
                input : newValue => directive = newValue,
            }
        });
        await tester.setup();
        await tester.mount(Editor);
        expect(tester.exists({ref:'empty'})).toBeTruthy();
    })
});