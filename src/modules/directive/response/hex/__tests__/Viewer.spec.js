import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ViewerHex from '../Viewer.vue'
describe('@/modules/directive/parameter/Editor.vue', () => {
    it('basic', async ( ) => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                value : directive,
                content : Buffer.from([0x31,0x032,0x20,0x00,0x34,0x35,0x36]),
            }
        });
        await tester.setup();
        await tester.mount(ViewerHex);
        expect(tester.wrapper.find('.directive-response-hex-entry').text()).toBe('0000000000 3132200034353600000000000000000000000000 12 .456.............');

        // change line size to 2
        await tester.input({ref:'inputLineSize'},2);
        let lines = tester.wrapper.findAll('.directive-response-hex-entry');
        expect(lines.length).toBe(4);
        expect(lines.at(0).text()).toBe('0000000000 3132 12');
        
        // radio line num radix
        await tester.emit({ref:'radioLineNumRadix'},'change',['dec']);
        lines = tester.wrapper.findAll('.directive-response-hex-entry');
        expect(lines.at(1).text()).toBe('0000000002 2000  .');
    })

    it('generate testcase expect content from response', async ( ) => {
        let content = ViewerHex.generateTestcaseExpectContentFromResponse(null, Buffer.from([0x01,0x02]));
        expect(content).toBe('0102');
    })
});