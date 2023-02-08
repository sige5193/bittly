import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js'
import ResponseParser from '../ResponseParser.js'
import Buffer from '../../../../../utils/test/Buffer.js'
describe('@/modules/directive/response/form/ResponseParser.js', () => {
    it('basic', async ( ) => {
        let tester = new Tester();
        await tester.setup();

        let directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {type:'bytes',length:2},
            {name:'str',type:'string',length:2},
            {type:'double'},
            {type:'unsigned_long_long',format:'hex'},
            {type:'long_long'},
            {type:'char'},
            {name:'no response here',type:'char'},
        ];

        let responseData = Buffer.from([
            0x30, 0x31, 
            50, 51, 
            52, 53, 54, 55, 56, 57, 58, 59, 
            0x01, 61, 62, 63, 64, 65, 66, 67,
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
            97,
        ]);
        let parser = new ResponseParser(directive, responseData);
        expect(parser.getIsComplete()).toBeFalsy();
        expect(parser.getValues().length).toBe(7);

        expect(parser.getValueByIndex(0)).toBe('30 31');
        expect(parser.getValueByIndex(2)).toBe('3.3792315273469386e-57');
        expect(parser.getValueByIndex(3)).toBe('01 3D 3E 3F 40 41 42 43');
        expect(parser.getValueByIndex(4)).toBe('72623859790382856');
        expect(parser.getValueByIndex(5)).toBe('a');
        expect(parser.getValueByIndex(6)).toBe('');

        expect(parser.getValueByName('not-exists')).toBe('');
        expect(parser.getValueByName('str')).toBe('23');
        
        expect(parser.getReadableValueByIndex(9999)).toBe('');
        expect(parser.getReadableValueByIndex(5)).toBe('a');
        expect(parser.getReadableValueByIndex(3)).toBe('89296008999158340');

        // get value by name with no data
        directive.responseFormatter = {};
        parser = new ResponseParser(directive, responseData);
        expect(parser.getValueByName('not-exist')).toBe('');
    });

    it('parse to last', async () => {
        let tester = new Tester();
        await tester.setup();

        // match one
        let directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {type:'byte',format:'hex'},
            {type:'byte',format:'hex'},
        ];
        let parser = new ResponseParser(directive, new Uint8Array([0x48, 0x49]), false);
        parser.parseToLast();
        let values = parser.getValues();
        expect(values[0]).toBe('48');
        expect(values[1]).toBe('49');

        // match one and half
        directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {type:'byte',format:'hex'},
            {type:'byte',format:'hex'},
        ];
        parser = new ResponseParser(directive, new Uint8Array([0x48, 0x49,0x01]), false);
        parser.parseToLast();
        values = parser.getValues();
        expect(values[0]).toBe('01');
        expect(values[1]).toBe('');

        // match two and get the last
        directive = new MdbDirective();
        directive.responseFormatter.fields = [
            {type:'byte',format:'hex'},
            {type:'byte',format:'hex'},
        ];
        parser = new ResponseParser(directive, new Uint8Array([0x48, 0x49,0x01,0x02]), false);
        parser.parseToLast();
        values = parser.getValues();
        expect(values[0]).toBe('01');
        expect(values[1]).toBe('02');

        // match none
        directive = new MdbDirective();
        directive.responseFormatter = {};
        parser = new ResponseParser(directive, new Uint8Array([0x48, 0x49,0x01,0x02]), false);
        parser.parseToLast();
        expect(parser.getValues().length).toBe(0);
    });

    it('throw an error if the length of string or bytes is 0', async () => {
        let tester = new Tester();
        await tester.setup();

        let directive = new MdbDirective();
        directive.responseFormatter.fields = [{type:'bytes',length:0}];

        let responseData = new Uint8Array([0x48, 0x49,0x01,0x02]);
        let parser = new ResponseParser(directive, responseData, false);
        expect(() => parser.parseToLast()).toThrowError('the length of response data type "bytes" can not be 0');
        
        directive.responseFormatter.fields = [{type:'string',length:0}];
        expect(() => parser.parseToLast()).toThrowError('the length of response data type "string" can not be 0');
    })
});