import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Editor from '../Editor.vue'
describe('@/modules/directive/parameter/hex/Editor.vue', () => {
    it('debug normal use', async ( ) => {
        let directive = new MdbDirective();

        let setup = new Tester();
        setup.prop('value', directive);
        setup.on('input', newValue => directive = newValue);
        await setup.setup();

        await setup.mount(Editor);
        await setup.input({ref:'inputarea',input:'textarea'}, "AA BB CC DD");
        expect(directive.requestContent.hex).toBe('AA BB CC DD');
    })
});