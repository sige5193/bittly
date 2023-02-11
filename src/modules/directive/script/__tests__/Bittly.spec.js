import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Bittly from '../Bittly.js';
describe('@/src/modules/directive/script/Bittly.js', () => {
    it('normal use', async () => {
        let tester = new Tester();
        await tester.setup();

        let directive = new MdbDirective();
        let bittly = new Bittly(directive);

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
        let bittly = new Bittly(directive);

        // bytesSum
        expect(bittly.bytesSum(
            bittly.uint8('FF'),
            bittly.string('0123456789'),
            bittly.int8(123)
        )).toBe(903);
        
        // bytesSum with bits
        expect(bittly.bytesSum(
            bittly.bits('01'),
            bittly.bits('111100'),
            bittly.uint8('FF')
        )).toBe(379);
    });

    it('date', async() => {
        let tester = new Tester();
        await tester.setup();
        let directive = new MdbDirective();
        let bittly = new Bittly(directive);

        let date = new Date('2023-01-03 03:04:05.678');
        expect(bittly.date('%Y-%m-%d-%H-%i-%s-%v-%y-%j-%n-%G', date)).toBe('2023-01-03-03-04-05-678-23-3-1-3');
        expect(bittly.date('%Y')).toBe((new Date()).getFullYear().toString());
    });

    it('date value', async () => {
        let tester = new Tester();
        await tester.setup();
        let directive = new MdbDirective();
        let bittly = new Bittly(directive);

        expect(bittly.uint8(1).value).toBe('1');
        expect(bittly.int8(1).value).toBe('1');
    });
});