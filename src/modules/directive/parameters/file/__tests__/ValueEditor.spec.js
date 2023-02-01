import Tester from '../../../../../utils/test/UnitTester.js'
import ValueEditor from '../ValueEditor.vue'
describe('@/modules/directive/parameter/file/ValueEditor.vue', () => {
    it('normal use', async ( done ) => {
        let params = {};
        let tester = new Tester();
        tester.prop('value', params);
        tester.on('input', newValue => {
            expect(newValue.path).toBe('DEMO-PATH');
            done();
        });
        await tester.setup();
        await tester.mount(ValueEditor);
        await tester.emit({ref:'upload'}, "change", [{
            file : {
                path : "DEMO-PATH"
            },
        }]);
    })
});