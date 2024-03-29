import Tester from '../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import QuickCallLib from '../QuickCallLib.js';
describe('@/src/modules/directive/script/QuickCallLib.js', () => {
    it('debug normal use', async () => {
        let directive = new MdbDirective();
        let tester = new Tester();
        await tester.setup();
        
        let quickCall = new QuickCallLib(directive);
        
        // crc16modbus
        expect(quickCall.crc16modbus('A','B', 'C')).toBe("20613");
        
        // random
        expect(quickCall.random(0, 100)*1).toBeGreaterThanOrEqual(0);
        expect(quickCall.random(0, 100)*1).toBeLessThanOrEqual(100);

        // echo 
        expect(quickCall.echo('hello')).toBe('hello');

        // lec
        expect(quickCall.lrc({type:'byte',format:'hex',value:'FF'})).toBe('1');

        // bcc
        expect(quickCall.bcc(
            {type:'byte',format:'hex',value:'FF'},
            {type:'byte',format:'hex',value:'AA'}
        )).toBe('85');
    })

    it('checksum8', async() => {
        let directive = new MdbDirective();
        let tester = new Tester();
        await tester.setup();
        let quickCall = new QuickCallLib(directive);

        expect(quickCall.checksum8(
            {type:'byte',format:'hex',value:'FF'},
            {type:'byte',format:'hex',value:'FF'}
        )).toBe('2');

        expect(quickCall.checksum8(
            {type:'bits',length:2,format:'bin',value:'01'},
            {type:'bits',length:6,format:'bin',value:'111100'},
            {type:'bytes',value:'FF',format:'hex'},
        )).toBe('133');
    });
});