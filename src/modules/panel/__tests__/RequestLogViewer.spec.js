import Tester from '../../../utils/test/UnitTester.js'
import RequestLogViewer from '../RequestLogViewer.vue'
describe('@/modules/panel/RequestLogViewer.vue', () => {
    it('normal use', async () => {
        let runtime = {
            requests : [{
                key : 1,
                time : new Date(),
                status : 'send',
                requestData : 'TEST-PARAMETER-TEXT',
                responseData : Buffer.from('RESPONSE-001'),
                widget : { directiveParamFormat : 'text' },
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
                executor : {customParamFormat:'text'}
            },{
                key : 2,
                time : new Date(),
                status : 'send',
                requestData : Buffer.from('TEST-PARAMETER-HEX'),
                widget : { directiveParamFormat : 'hex' },
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {
                        fields : [{
                            name : 'F01',
                            type : 'byte',
                            format : 'hex',
                        }, {
                            name : '',
                            type : 'string',
                        }],
                    },
                },
                executor : {
                    customParamFormat:'hex',
                    getResponseAsForm() {
                        return {
                            getValueByIndex( index ) {
                                return ['FF'][index];
                            }
                        };
                    }
                }
            },{
                key : 3,
                time : new Date(),
                status : 'send',
                widget : { 
                    directiveParamFormat : 'file',
                    directiveParams : '/fake/test.file',
                },
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
                executor : {customParamFormat:'file'}
            },{
                key : 4,
                time : new Date(),
                status : 'send',
                widget : { 
                    directiveParamFormat : 'form',
                },
                executor : {
                    customParamFormat:'form',
                    getParamBuilder : () => { return { 
                        getBuildHandler() { 
                            return {
                                getFormRawData() {
                                    return [
                                        {name : 'F01',value : 'V01'},
                                        {name:'',value:'V02'},
                                    ];
                                }
                            }
                        }
                    }},
                },
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
            },{
                key : 5,
                time : new Date(),
                status : 'send',
                widget : { 
                    directiveParamFormat : 'form',
                },
                executor : {
                    customParamFormat:'form',
                    getParamBuilder : () => { return null; },
                },
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
            }, {
                key : 6,
                time : new Date(),
                status : 'send',
                widget : { directiveParamFormat : 'none' },
                executor : {customParamFormat:'none'},
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
            },{
                key : 7,
                time : new Date(),
                status : 'send',
                requestData : 'how are you ?',
                executor : {customParamFormat:'unkonw'},
                directive : {
                    name : 'TEST-DIRECTIVE',
                    responseFormatter : {},
                },
                widget : {
                    directiveParamFormat : 'unkonw',
                }, 
            }],
        };

        let tester = new Tester({
            props : {runtime : runtime}
        });
        await tester.setup();
        let wrapper = await tester.mount(RequestLogViewer);
        wrapper.vm.refresh();
        await tester.msleep(200);

        let requestLogItems = wrapper.findAll('.request-log-item');
        // expect(requestLogItems.length).toBe(2);

        // request #01
        expect(requestLogItems.at(0).find('.request-log-param-data-block').text()).toBe('[Text] TEST-PARAMETER-TEXT');
        expect(requestLogItems.at(0).find('.request-log-response-data-block').text()).toBe('52 45 53 50 4F 4E 53 45 2D 30 30 31');

        // request #02
        expect(requestLogItems.at(1).find('.request-log-param-data-block').text()).toBe('[HEX] 54 45 53 54 2D 50 41 52 41 4D 45 54 45 52 2D 48 45 58');
        expect(requestLogItems.at(1).find('.request-log-response-data-block').text()).toBe('F01 = 0xFF; {1} =');

        // request #03
        expect(requestLogItems.at(2).find('.request-log-param-data-block').text()).toBe('[File] /fake/test.file');

        // request #04
        expect(requestLogItems.at(3).find('.request-log-param-data-block').text()).toBe('[Form] F01 = V01; {1} = V02');

        // request #05
        expect(requestLogItems.at(4).find('.request-log-param-data-block').text()).toBe('[Form] ERROR');

        // request #06
        expect(requestLogItems.at(5).find('.request-log-param-data-block').text()).toBe('[None]');

        // request #07
        expect(requestLogItems.at(6).find('.request-log-param-data-block').text()).toBe('unknown ~~~');
    })
});