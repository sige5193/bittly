import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ViewerText from '../Viewer.vue'
describe('@/modules/directive/parameter/Editor.vue', () => {
    it('normal use', async ( ) => {
        let directive = new MdbDirective();

        let tester = new Tester({
            props : {
                value : directive,
                content : Buffer.from('HELLO'),
            },
        });
        await tester.setup();

        let wrapper = await tester.mount(ViewerText, true);
        expect(wrapper.findComponent({ref:'viewer'}).props('value')).toBe('HELLO');

        // update content
        wrapper.setProps({content:Buffer.from('{"name":"sige"}')});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref:'viewer'}).props('value')).toBe('{"name":"sige"}');

        // json viewer
        let radioMode = wrapper.findComponent({ref:'radioMode'});
        await wrapper.setData({ mode: 'javascript' })
        await radioMode.vm.$emit('change', 'javascript');
        expect(wrapper.findComponent({ref:'viewer'}).props('value')).toBe('{\n    "name": "sige"\n}');

        // bad json
        wrapper.setProps({content:Buffer.from('{"name":"')});
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ref:'viewer'}).props('value')).toBe('{"name":"');

        // generate testcase content
        expect(ViewerText.generateTestcaseExpectContentFromResponse(directive, Buffer.from('123'))).toBe('123');
    })
});