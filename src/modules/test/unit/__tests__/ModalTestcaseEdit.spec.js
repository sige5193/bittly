import UnitTester from '../../../../utils/test/UnitTester.js';
import ModalTestcaseEdit from '../ModalTestcaseEdit.vue'
import MdbDirective from '../../../../models/MdbDirective.js'
describe('@/src/modules/test/unit/ModalTestcaseEdit.vue', () => {
    it('basic', async ( done ) => {
        let tester = new UnitTester();
        await tester.setup();
        await tester.mount(ModalTestcaseEdit);
        
        let directive = new MdbDirective();
        directive.responseFormatter.fields = [];
        tester.wrapper.vm.open(directive);
        done();
        
        
        // let setup = new TestCaseSetup();
        // await setup.setup();

        // let directive = new MdbDirective();
        // let wrapper = await setup.mount(ModalTestcaseEdit);
        // wrapper.vm.open(directive).then((testcase) => {
        //     expect(testcase.title).toBe('TEST-NAME');

        // });
        // await setup.msleep(1000);
        
        // await setup.comInputChange(wrapper, 'inputTitle','TEST-NAME');

        // let modalEditor = wrapper.findComponent({ref:'modalEdit'});
        // await modalEditor.vm.$emit('ok');
    })
});