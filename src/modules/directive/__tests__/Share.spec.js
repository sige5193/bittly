import Tester from '../../../utils/test/UnitTester.js';
import Share from '../Share.vue'
import MdbDirective from '@/models/MdbDirective.js'
describe('@/src/modules/directive/Share.vue', () => {
    it('share without response', async ( ) => {
        let directive = new MdbDirective();
        directive.name = 'TEST-001';

        let bittlyShare = jest.fn();
        let tester = new Tester({
            props : {
                directive : directive,
                response : null,
            },
            mockBittlyApiClient : {shareCreate : bittlyShare},
        });
        await tester.setup();
        await tester.mount(Share);
        tester.wrapper.vm.execute();
        await tester.msleep(500);
        
        bittlyShare.mockResolvedValue({success:true, data:{link:'http://test.link', expired_at : '2222'}});
        await tester.click({ref:'btnGenLink'});
        await tester.msleep(100);
        expect(bittlyShare.mock.calls[0][0].type).toBe('directive');
        expect(JSON.parse(bittlyShare.mock.calls[0][0].data).name).toBe('TEST-001');

        let clipboardWriteText = jest.fn();
        clipboardWriteText.mockResolvedValue('OK');
        window.navigator.clipboard = {writeText : clipboardWriteText};
        await tester.click({ref:'btnLinkCopy'});
        await tester.msleep(100);
        expect(clipboardWriteText.mock.calls[0][0]).toBe('http://test.link');
    })

    it('share with response', async ( ) => {
        let directive = new MdbDirective();
        directive.name = 'TEST-001';

        let bittlyShare = jest.fn();
        let tester = new Tester({
            props : {
                directive : directive,
                response : "RESPONSE",
            },
            mockBittlyApiClient : {shareCreate : bittlyShare},
        });
        await tester.setup();
        await tester.mount(Share);
        tester.wrapper.vm.execute();
        await tester.msleep(500);
        
        bittlyShare.mockResolvedValue({success:false, data:null, message:'TEST-MESSAGE'});
        await tester.click({ref:'btnGenLink'});
        await tester.msleep(100);
        expect(bittlyShare.mock.calls[0][0].type).toBe('directive');

        let shareData = JSON.parse(bittlyShare.mock.calls[0][0].data);
        expect(shareData.name).toBe('TEST-001');
        expect(atob(shareData.responseData)).toBe('RESPONSE');
    })
});