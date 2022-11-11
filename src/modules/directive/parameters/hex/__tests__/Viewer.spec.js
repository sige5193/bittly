import Tester from '../../../../../utils/test/UnitTester.js';
import Viewer from '../Viewer.vue'
describe('@/modules/directive/parameter/hex/Viewer.vue', () => {
    it('normal use', async ( ) => {
        let tester = new Tester({
            props : {
                executor : {
                    getParamBuilder : function() {
                        return {
                            getRequestBuffer:function() {
                                return Buffer.from([1,97,3]);
                            }
                        };
                    }
                }
            },
        });
        await tester.setup();

        let wrapper = await tester.mount(Viewer);
        expect(wrapper.findComponent({ref:'hexViewer'}).text()).toBe('016103');
        expect(wrapper.findComponent({ref:'asciiViewer'}).text()).toBe('.a.');

        await tester.trigger('.byte','mouseenter');
        await tester.trigger('.byte','mouseleave');

        tester.wrapper.setProps({executor:null});
        await tester.msleep(100);

        tester.wrapper.setProps({executor:{getParamBuilder:()=>null}});
        await tester.msleep(100);
    })
});