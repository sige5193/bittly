import MyObject from '../MyObject.js'
describe('@/utils/datatype/MyObject.js', () => {
    it('isEqual', async () => {
        expect(MyObject.isEqual({}, {})).toBeTruthy();
        expect(MyObject.isEqual(1, 1)).toBeTruthy();
        expect(MyObject.isEqual('1', 1)).toBeFalsy();
        expect(MyObject.isEqual(null, {})).toBeFalsy();
        expect(MyObject.isEqual({a:1,b:1}, {a:1})).toBeFalsy();
        expect(MyObject.isEqual({a:{a:null}}, {a:{a:null}})).toBeTruthy();
        expect(MyObject.isEqual({a:1,b:1}, {a:1,b:2})).toBeFalsy();
    })
});