import Tester from '../../../../../utils/test/UnitTester.js'
import ValueEditor from '../ValueEditor.vue'
describe('@/modules/directive/parameter/file/ValueEditor.vue', () => {
    it('normal use', async ( done ) => {
        let params = {};
        let tester = new Tester({
            props: {
                value : params,
            },
            listeners : {
                input : ( newValue ) => {
                    expect(newValue).toBe('DEMO-PATH');
                    done();
                }
            }
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