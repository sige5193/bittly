import Tester from '../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import Builder from '../../Builder.js';
import BuildHandler from '../BuildHandler.js'
describe('@/modules/directive/parameter/form/BuildHandler.js', () => {
    it('basic', async ( ) => {
        let tester = new Tester();
        tester.store.state.envVariables = {
            envVar001 : {value:'EV01'},
        };
        await tester.setup();
        
        let project = await tester.activeNewProject();

        window.fs = {
            constants : { R_OK : 1 },
            accessSync : () => true,
            readFileSync : () => new Uint8Array([65,66,67]),
        };

        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.requestFormat = 'form';
        
        // empty field list
        directive.requestContent.form = [];
        let builder = new Builder(directive);
        await builder.init();
        expect(builder.getRequestBuffer().toString()).toBe('');
        
        // all data types
        directive.requestContent.form = [
            {name:'F01',type:'byte',value:'65',format:'dec'},
            {name:'F02',type:'char',value:'B'},
            {name:'F03',type:'float',value:'B'},
            {name:'F04',type:'bytes',value:'aa bb cc dd'},
            {name:'F05',type:'char_int',value:'100'},
            {name:'F06',type:'file',value:'demo-file.txt'},
            {name:'F07',type:'string',value:''},
        ];
        builder = new Builder(directive);
        await builder.init();
        expect(builder.getRequestBuffer().toString('hex').toUpperCase()).toBe([
            '41','42','0000C07F','AABBCCDD','64','414243'
        ].join(''));
        
        let handler = builder.getBuildHandler();
        expect(handler.getTypeName()).toBe('form');
        
        let formData = handler.getFormRawData();
        expect(formData[0].value).toBe('65');
        
        // error field config
        tester.expectError(() => BuildHandler.convertFormItemToBin(directive, {name:'F07',type:'bad-type',value:''}), 'unable to handle item');
    })
});