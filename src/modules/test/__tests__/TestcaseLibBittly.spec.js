import TestcaseLibBittly from '../TestcaseLibBittly.js'
import MdbDirective from '@/models/MdbDirective.js'
describe('@/src/modules/test/TestcaseLibBittly.js', () => {
    it('normal use', async () => {
        let bittly = new TestcaseLibBittly({});
        expect(bittly).toBeInstanceOf(TestcaseLibBittly);
    })
});