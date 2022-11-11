import Tester from '../../../../../../utils/test/UnitTester.js';
import MdbDirective from '@/models/MdbDirective.js'
import ParserDataFrame from '../DataFrame.vue'
import Buffer from '../../../../../../utils/test/Buffer.js'
describe('@/modules/directive/response/plotter/Viewer.vue', () => {
    it('basic', async () => {
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                directive : directive,
                value : {
                    header : 'FF00',
                    tail : '00FF',
                    dataType : 'byte',
                    lengthDatatype : 'byte',
                    channelCount : 2,
                    dynamicLengthEnable : true,
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);
        let updateOptions = wrapper.vm.getUpdatedOptions();
        expect(updateOptions.header).toBe('FF00');
    })

    it('parser empty header and tail', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    header : '',
                    tail : '',
                    dataLength : 4,
                    dataType : 'byte',
                    channelCount : 2,
                    dynamicLengthEnable : false,
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);
        let buffer = Buffer.from([
            0x01,0x02,0x03,0x04, // data
        ]);
        
        wrapper.vm.parse(buffer);
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([ 1, 2 ]);
        expect(channelDataPush.mock.calls[1][0]).toStrictEqual([ 3, 4 ]);
    })

    it('parser tail not match', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    header : 'AA',
                    tail : 'FF',
                    dataLength : 4,
                    dataType : 'byte',
                    channelCount : 2,
                    dynamicLengthEnable : false,
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);
        let buffer = Buffer.from([
            0xAA, // header
            0x01,0x02,0x03,0x04, // data
            0xFC, // wrong tail
            0xAA, // header
            0x05,0x06,0x07,0x08, // data
            0xFF, // tail
        ]);
        
        wrapper.vm.parse(buffer);
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([ 5, 6 ]);
        expect(channelDataPush.mock.calls[1][0]).toStrictEqual([ 7, 8 ]);
    })

    it('parser dynamic length disabled', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    header : 'FF00',
                    tail : '00FF',
                    dataLength : 4,
                    dataType : 'byte',
                    channelCount : 2,
                    dynamicLengthEnable : false,
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);
        let buffer = Buffer.from([
            0xff,0x00, // header
            0x01,0x02,0x03,0x04, // data
            0x00,0xff, // tail
        ]);
        
        wrapper.vm.parse(buffer);
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([ 1, 2 ]);
        expect(channelDataPush.mock.calls[1][0]).toStrictEqual([ 3, 4 ]);
    })
    
    it( 'parse header:FF00 tail:00FF len:dynamic(uint8) channel:2 datatype:uint8', async () => {
        let channelDataPush = jest.fn();
        let directive = new MdbDirective();
        let tester = new Tester({
            props : {
                channelDataPush,
                directive : directive,
                value : {
                    header : 'FF00',
                    tail : '00FF',
                    dataType : 'byte',
                    lengthDatatype : 'byte',
                    channelCount : 2,
                    dynamicLengthEnable : true,
                }
            },
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);
        
        let buffer = Buffer.from([
            0xff,0x00, // header
            0x04, // length
            0x01,0x02,0x03,0x04, // data
            0x00,0xff, // tail
            0x00,0x00,0x00,0x00,0x00,0x00,0x00
        ]);

        wrapper.vm.parse(buffer);
        expect(channelDataPush).toBeCalledTimes(2);
        expect(channelDataPush.mock.calls[0][0]).toStrictEqual([ 1, 2 ]);
        expect(channelDataPush.mock.calls[1][0]).toStrictEqual([ 3, 4 ]);
    });

    it('parse empty data', async ( ) => {
        let directive = new MdbDirective();
        
        let tester = new Tester({
            props : {
                value : {},
                directive : directive
            }
        });
        await tester.setup();
        let wrapper = await tester.mount(ParserDataFrame);

        // parser with data is null
        expect(wrapper.vm.parse(null)).toBe(0);
    })
});