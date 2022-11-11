import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Script from '../Script.vue'
describe('@/modules/directive/response/plotter/parsers/Script.vue', () => {
    it( 'basic', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    script : `
                        let ch01 = $this.channelAdd('C01');
                        $this.channelDataPush(ch01, 1);
                    `
                }
            },
            stubs : {
                'parser-setting-editor' : {
                    template : '<div><slot></slot></div>',
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(Script, true);

        wrapper.vm.parse("1 2\r\n3 4");
        expect(channelDataPush).toBeCalledTimes(1);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([ 1 ]);
        
        // open help link
        window.shell = {openExternal : jest.fn()};
        await tester.click({ref:'btnHelpLink'}, null, 0);
        expect(window.shell.openExternal).toBeCalled();

        // get parser options
        expect(tester.wrapper.vm.getUpdatedOptions().script).not.toBe('');

        let vm = tester.wrapper.vm;
        // parser empty content
        expect(vm.parse(null)).toEqual(0);

        // bad script
        vm.options.script = `let x=1; let x=2;`;
        tester.expectError(() => vm.parse(Buffer.from([1])), 'Failed to execute parser script : Identifier \'x\' has already been declared');
    });
});