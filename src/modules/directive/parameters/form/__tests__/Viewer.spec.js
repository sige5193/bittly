import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Viewer from '../Viewer.vue'
describe('@/modules/directive/parameter/form/Viewer.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'xxx', name:'NAME',type:'byte',format:'hex',value:'FF',desc:'DESC'}
        ];

        let executorGetParamBuilder = jest.fn(() => {
            return {
                getBuildHandler : function() {
                    return {
                        getTypeName() { return 'form'; },
                        getFormRawData : function () {
                            return [{value:'AA'}];
                        }
                    }
                }
            };
        });
        let executor = {
            getParamBuilder: executorGetParamBuilder
        };
        let tester = new Tester({
            props : {
                content : null,
                directive : directive,
                executor : executor,
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(Viewer);

        expect(wrapper.findComponent({ref:'inputName_0'}).element.value).toBe('NAME');
        expect(wrapper.findComponent({ref:'selectDataType_0'}).props('value')).toBe('byte');
        expect(wrapper.findComponent({ref:'selectValueDataType_0'}).props('value')).toBe('hex');
        expect(wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('AA');
        expect(wrapper.findComponent({ref:'inputDesc_0'}).element.value).toBe('DESC');
    })

    it('empty param builder', async ( ) => {
        let directive = new MdbDirective();
        directive.requestContent.form = [
            {key:'xxx', name:'NAME',type:'byte',format:'hex',value:'FF',desc:'DESC'}
        ];

        let executor = {
            getParamBuilder: () => null
        };
        let tester = new Tester({
            props : {
                content : null,
                directive : directive,
                executor : executor,
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(Viewer);

        expect(wrapper.findComponent({ref:'inputValueUnsigned_0'}).find('input').element.value).toBe('');
    })
});