import MdbDirective from '../../../../../models/MdbDirective.js';
import RequestParamBuilder from '../RequestParamBuilder.js'
import Tester from '../../../../../utils/test/UnitTester.js'
describe('@/communicators/http/RequestParamBuilder.js', () => {
    it('full post', async() => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            urlEnv : {value:'ENV-URL'},
            headerEnvName : {value:'ENV-HEADER-NAME'},
            headerEnvValue : {value:'ENV-HEADER-VALUE'},
            cookieEvnName : {value:'ENV-COOKIE-NAME'},
            cookieEnvValue : {value:'ENV-COOKIE-VALUE'},
        };
        await tester.setup();

        

        let directive = new MdbDirective();
        directive.requestScript = '$this.variableSet("scriptValue","SCRIPTVVALUE");';
        directive.requestFormat = 'text';
        directive.requestContent.text = 'xxxxxx';

        let builder = new RequestParamBuilder(directive);
        
        // url is required
        await tester.expectError(async () => builder.getUrl(), 'Please input request URL');
        // url is ok
        directive.target.httpUrl = 'https://www.example.com/{{env.urlEnv}}';
        expect(builder.getUrl()).toBe('https://www.example.com/ENV-URL');
        
        // method is required
        await tester.expectError(async () => builder.getMethod(), 'target method is required');
        directive.target.httpMethod = 'POST';
        expect(builder.getMethod()).toBe('POST');
        
        // empty headers
        expect(Object.keys(builder.getHeaders()).length).toBe(0);
        // build headers
        directive.target.httpHeaders = [
            {name:'h001',value:'v001'},
            {name:'',value:'v001'}, // empty name would not be used.
            {name:'{{env.headerEnvName}}', value:'{{env.headerEnvValue}}'}, // env
            {name:'{{scriptValue}}', value:'{{scriptValue}}'}, // script value
            {name:'',value:''}
        ];
        directive.target.httpCookies = [
            {name:'h001',value:'v001'},
            {name:'',value:'v001'}, // empty name would not be used.
            {name:'{{env.cookieEvnName}}', value:'{{env.cookieEnvValue}}'}, // env
            {name:'{{scriptValue}}', value:'{{scriptValue}}'}, // script value
            {name:'',value:''}
        ];
        let headers = builder.getHeaders();
        expect(headers.h001).toBe('v001');
        expect(headers['ENV-HEADER-NAME']).toBe('ENV-HEADER-VALUE');
        expect(headers.SCRIPTVVALUE).toBe('SCRIPTVVALUE');
        expect(headers['Content-Type']).toBe('text/plain');
        expect(headers['Content-Length']).toBe(0);
        expect(headers['Cookie']).toBe('h001=v001; ENV-COOKIE-NAME=ENV-COOKIE-VALUE; SCRIPTVVALUE=SCRIPTVVALUE');
        
        expect(builder.getBody()).toBe(directive.requestContent.text);
        expect(builder.getRequestData()).toBe(builder);
        expect(builder.getRequestBuffer().toString()).toBe(directive.requestContent.text);
    });

    it('RequestParamBuilder::getBody - text', async () => {
        let tester = new Tester();
        await tester.setup();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };

        let directive = new MdbDirective();
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [];
        directive.requestFormat = 'text';
        directive.requestContent.text = 'xxxxxx';
        let builder = new RequestParamBuilder(directive);
        let body = builder.getBody();
        let headers = builder.getHeaders();
        expect(headers['Content-Type']).toBe('text/plain');
        expect(body).toBe(directive.requestContent.text);
    });

    it('RequestParamBuilder::getBody - form - multipart/form-data', async () => {
        let tester = new Tester();
        await tester.setup();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };
        window.fs = {
            accessSync : () => {},
            constants : {R_OK:true},
            readFileSync : () => 'FAKE-FILE-CONTENT',
        };

        let directive = new MdbDirective();
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [{name:'Content-Type',value:'multipart/form-data'}];
        directive.target.httpCookies = [];
        directive.requestFormat = 'form';
        directive.requestContent.form = [
            {name:'F001',type:"string",value:"V001"},
            {name:'F002',type:"string",value:"V002"},
            {name:'F003',type:"byte",format:'hex',value:"FF"},
            {name:'F004',type:"bytes",value:"FF AA"},
            {name:'F005',type:"file",value:"/fake/file/path"},
        ];
        let builder = new RequestParamBuilder(directive);
        
        let body = builder.getBody();
        body = body.toString();
        expect(body).toMatch('Content-Disposition: form-data; name="F001"');
        expect(body).toMatch('Content-Disposition: form-data; name="F002"');
        expect(body).toMatch('Content-Disposition: form-data; name="F003"');
        let headers = builder.getHeaders();
        expect(headers['Content-Type']).toMatch('multipart/form-data; boundary=');
    });

    it('RequestParamBuilder::getBody - form - application/x-www-form-urlencoded', async () => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };
        await tester.setup();
        
        window.fs = {
            accessSync : () => {},
            constants : {R_OK:true},
            readFileSync : () => 'FAKE-FILE-CONTENT',
        };

        let directive = new MdbDirective();
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [{name:'Content-Type',value:'application/x-www-form-urlencoded'}];
        directive.requestFormat = 'form';
        directive.requestContent.form = [
            {name:'F001',type:"string",value:"V001"},
            {name:'F002',type:"string",value:"V002"},
            {name:'F003',type:"file",value:"/fake/file/path"},
        ];
        let builder = new RequestParamBuilder(directive);
        let body = builder.getBody();
        body = body.toString();
        expect(body).toBe('F001=V001&F002=V002&F003=FAKE-FILE-CONTENT');
    });

    it('RequestParamBuilder::getBody - form - other content types', async () => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };
        await tester.setup();
        
        window.fs = {
            accessSync : () => {},
            constants : {R_OK:true},
            readFileSync : () => 'FAKE-FILE-CONTENT',
        };

        let directive = new MdbDirective();
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [{name:'Content-Type',value:'custom'}];
        directive.requestFormat = 'form';
        directive.requestContent.form = [
            {name:'F001',type:"string",value:"V001"},
            {name:'F002',type:"string",value:"V002"},
        ];
        let builder = new RequestParamBuilder(directive);
        let body = builder.getBody();
        body = body.toString();
        expect(body).toBe('V001V002');
    });

    it('RequestParamBuilder::getBody -  hex & file & other', async () => {
        let tester = new Tester();
        await tester.setup();

        let directive = new MdbDirective();
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [{name:'Content-Type',value:'custom'}];
        directive.requestFormat = 'hex';
        directive.requestContent.hex = '75 73 65';
        let builderHex = new RequestParamBuilder(directive);
        expect(builderHex.getBody().toString()).toBe('use');

        window.fs = {
            accessSync : () => {},
            constants : {R_OK:true},
            readFileSync : () => 'FAKE-FILE-CONTENT',
        };
        directive.requestFormat = 'file';
        directive.requestContent.file = {path:'/fake/file/path',sendMode:'All'};
        let builderFile = new RequestParamBuilder(directive);
        expect(builderFile.getBody().toString()).toBe('FAKE-FILE-CONTENT');
    });

    it('RequestParamBuilder::getHeaders', async () => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };
        await tester.setup();
        
        let directive = new MdbDirective();
        directive.requestScript = '$this.variableSet("scriptValue","SCRIPTVVALUE");';
        directive.target.httpHeaders = [
            {name:'h001',value:'v001'},
            {name:'',value:'v001'}, // empty name would not be used.
            {name:'{{env.test}}', value:'{{env.test}}'}, // env
            {name:'{{scriptValue}}', value:'{{scriptValue}}'}, // script value
            {name:'',value:''}
        ];
        directive.target.httpCookies = [
            {name:'h001',value:'v001'},
            {name:'',value:'v001'}, // empty name would not be used.
            {name:'{{env.test}}', value:'{{env.test}}'}, // env
            {name:'{{scriptValue}}', value:'{{scriptValue}}'}, // script value
            {name:'',value:''}
        ];

        let builder = new RequestParamBuilder(directive);
        builder.getBody();
        let headers = builder.getHeaders();
        expect(headers.h001).toBe('v001');
        expect(headers.ENVTEST).toBe('ENVTEST');
        expect(headers.SCRIPTVVALUE).toBe('SCRIPTVVALUE');
        expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
        expect(headers['Content-Length']).toBe(0);
        expect(headers['Cookie']).toBe('h001=v001; ENVTEST=ENVTEST; SCRIPTVVALUE=SCRIPTVVALUE');
    });

    it('RequestParamBuilder::getHeaders - content type detect', async () => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            test : {value:'ENVTEST'}
        };
        await tester.setup();
        
        let directive = new MdbDirective();
        directive.requestFormat = 'hex';
        directive.target.httpMethod = 'POST';
        directive.target.httpHeaders = [];
        let builderHex = new RequestParamBuilder(directive);
        let headers = builderHex.getHeaders();
        expect(headers['Content-Type']).toBe('application/octet-stream');

        directive.requestFormat = 'text';
        let builderText = new RequestParamBuilder(directive);
        headers = builderText.getHeaders();
        expect(headers['Content-Type']).toBe('text/plain');

        directive.requestFormat = 'file';
        let builderFile = new RequestParamBuilder(directive);
        headers = builderFile.getHeaders();
        expect(headers['Content-Type']).toBe('application/octet-stream');

        directive.requestFormat = 'form';
        directive.requestContent.form = [
            {name:'F001',type:"string",value:"V001"},
            {name:'F002',type:"string",value:"V002"},
        ];
        let builderForm = new RequestParamBuilder(directive);
        builderForm.getBody();
        headers = builderForm.getHeaders();
        expect(headers['Content-Type']).toMatch('multipart/form-data');
    });
});