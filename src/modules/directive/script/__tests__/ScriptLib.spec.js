import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ScriptLib from '../ScriptLib.js';
describe('@/src/modules/directive/script/ScriptLib.js', () => {
    it('normal use', async () => {
        let tester = new Tester();
        await tester.setup();

        let directive = new MdbDirective();
        let bittly = new ScriptLib(directive);

        // echo
        expect(bittly.echo('hello')).toBe('hello');

        // timestamp
        expect(bittly.timestamp()).toBeLessThanOrEqual((new Date()).getTime() / 1000);

        // random
        expect(bittly.random(100, 999)).toBeLessThanOrEqual(999);
        
        // crc
        expect(bittly.crc('crc16modbus',"1234567890")).toBe(0xC20A);
    })

    it('byteSum', async() => {
        let tester = new Tester();
        await tester.setup();
        let directive = new MdbDirective();
        let bittly = new ScriptLib(directive);

        // bytesSum
        expect(bittly.bytesSum(
            {type:'uint8',value:'FF',format:'hex'},
            {type:'string', value:'0123456789'},
            {type:'int8', value:123}
        )).toBe(903);

        // bytesSum with bits
        expect(bittly.bytesSum(
            {type:'bits',length:2,format:'bin',value:'01'},
            {type:'bits',length:6,format:'bin',value:'111100'},
            {type:'uint8',value:'FF',format:'hex'},
        )).toBe(379);
    });
});