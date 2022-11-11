import Tester from '../../../../../utils/test/UnitTester.js';
import TargetEditor from '../TargetEditor.vue'
describe('@/communicators/http/TargetEditor.vue', () => {
    it('normal use', async ( ) => {
        let target = {};
        
        let tester = new Tester({
            props : {
                value : target
            },
            listeners : {
                input : (newTarget) => target = newTarget
            },
        });
        await tester.setup();
        await tester.mount(TargetEditor);

        // init attributes
        expect(target.httpMethod).toBe('GET');
        expect(target.httpUrl).toBe('');
        expect(target.httpQuery.length).toBe(1);
        expect(target.httpQuery[0].name).toBe('');
        expect(target.httpHeaders.length).toBe(1);
        expect(target.httpHeaders[0].name).toBe('');
        expect(target.httpCookies.length).toBe(1);
        expect(target.httpCookies[0].name).toBe('');
        expect(target.httpFollowRedirectMaxCount).toBe(10);
        expect(target.httpFollowRedirectEnable).toBeTruthy();
        expect(target.httpResponseHeaderEnable).toBeFalsy();

        // base config
        await tester.select({ref:'sltMethod'}, 'POST');
        expect(target.httpMethod).toBe('POST');
        await tester.input({ref:'txtUrl'}, 'https');
        await tester.input({ref:'txtUrl'}, 'https://www.example.com?p=v');
        expect(target.httpUrl).toBe('https://www.example.com?p=v');

        // ext config
        await tester.click({ref:'btnOptionsEdit'});
        expect(tester.wrapper.vm.$data.modalRequestOptionEnable).toBeTruthy();

        // input query
        await tester.input({ref:'txtQueryItemName_0'}, 'QueryName001');
        await tester.input({ref:'txtQueryItemValue_0'}, 'QueryValue001');
        await tester.input({ref:'txtQueryItemName_1'}, 'QueryName002');
        await tester.input({ref:'txtQueryItemValue_1'}, 'QueryValue002');
        await tester.click({ref:'btnQueryItemDelete_1'});
        await tester.click({ref:'btnQueryItemDelete_0'});
        await tester.click({ref:'btnQueryItemDelete_0'});
        await tester.input({ref:'txtQueryItemName_0'}, 'QueryName003');
        await tester.input({ref:'txtQueryItemValue_0'}, 'QueryValue003');

        // // input header
        expect(tester.wrapper.vm.$data.modalRequestOptionEnable).toBeTruthy();
        tester.wrapper.setData({ modalRequestOptionPanel:'header'});
        await tester.msleep(200);
        await tester.input({ref:'txtHeaderItemName_0'}, 'HeaderName001');
        await tester.input({ref:'txtHeaderItemValue_0'}, 'HeaderValue001');
        // input cookie
        tester.wrapper.setData({ modalRequestOptionPanel:'cookie'});
        await tester.msleep(200);
        await tester.input({ref:'txtCookieItemName_0'}, 'CookieName001');
        await tester.input({ref:'txtCookieItemValue_0'}, 'CookieValue001');
        
        await tester.emit({ref:'modalOptionEdit'}, 'ok');
        await tester.msleep(2000);
        expect(tester.wrapper.vm.$data.modalRequestOptionEnable).toBeFalsy();
        expect(target.httpQuery[0].name).toBe('QueryName003');
        expect(target.httpQuery[0].value).toBe('QueryValue003');
        expect(target.httpHeaders[0].name).toBe('HeaderName001');
        expect(target.httpHeaders[0].value).toBe('HeaderValue001');
        expect(target.httpCookies[0].name).toBe('CookieName001');
        expect(target.httpCookies[0].value).toBe('CookieValue001');

        let editorConfig = TargetEditor.editorConfig();
        expect(editorConfig.name).toBe('HTTP');
        expect(editorConfig.defaultDataType).toBe('string');
        expect(editorConfig.defaultResponseViewer).toBe('text');
    }, 50000)
});