import Tester from '../../../../../utils/test/UnitTester.js';
import ScriptParameterHandler from '../ScriptParameterHandler.js'
describe('@/modules/directive/parameter/form/ScriptParameterHandler.js', () => {
    it('basic', async ( ) => {
        let tester = new Tester();
        await tester.setup();
        
        let handler = null;
        handler = new ScriptParameterHandler();
        handler.fields = [
            {name:'f01',value:'v01'},
            {name:'f02',value:'v01'},
            {name:'f03'},
            {name:'f04'},
            {name:'f05'}
        ];
        expect(handler.itemGetByName('f01').name).toBe('f01');
        expect(handler.itemGetByName('not-exists')).toBeNull();
        expect(handler.itemGetByIndex(1).name).toBe('f01');
        expect(handler.itemGetByIndex(0)).toBeNull();
        expect(handler.itemsGetByIndexes(1,3,5).length).toBe(3);
        expect(handler.itemsGetByIndexes(1,{from:2,to:4},5).length).toBe(5);
        expect(handler.valueGetByIndex(1)).toBe('v01');
        expect(handler.valueGetByName('f01')).toBe('v01');
        tester.expectError(()=>handler.itemsGetByIndexes(100), 'Unable to get parameter by row number : 100');
        tester.expectError(()=>handler.itemsGetByIndexes({}),'Row number range requires start number by "from"');
        tester.expectError(()=>handler.itemsGetByIndexes({from:1}),'Row number range requires end number by "to"');
        tester.expectError(()=>handler.itemsGetByIndexes({from:-1,to:0}),'Unable to get parameter by row number : -1');
    })
});