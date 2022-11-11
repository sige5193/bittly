import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Viewer from '../Viewer.vue'
describe('@/modules/directive/parameter/text/Viewer.vue', () => {
    it('normal use', async ( ) => {
        let tester = new Tester({
            props : {
                directive : new MdbDirective(),
                executor : {
                    getParamBuilder : function() {
                        return {
                            getRequestBuffer:function() {
                                return Buffer.from('1234');
                            }
                        };
                    }
                }
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        expect(tester.wrapper.findComponent({ref:'textViewer'}).text()).toBe('1234');

        // executor is null
        tester = new Tester({
            props : {
                directive : new MdbDirective(),
                executor : null
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        expect(tester.wrapper.findComponent({ref:'textViewer'}).text()).toBe('');

        // param builder is null
        tester = new Tester({
            props : {
                directive : new MdbDirective(),
                executor : { getParamBuilder : () => null, }
            },
        });
        await tester.setup();
        await tester.mount(Viewer);
        expect(tester.wrapper.findComponent({ref:'textViewer'}).text()).toBe('');
    })
});