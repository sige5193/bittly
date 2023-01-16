import FunctionalSetup from '../../../../utils/test/FunctionalSetup.js';
describe('@/src/modules/mock : Basic', () => {
    it('webdriver ui', async () => {
        let tester = await FunctionalSetup.setup();
        /* actions start */
        // Click : 
        await tester.click('li.ant-menu-item-active > i.anticon-robot > svg');
        // Click : 创建
        await tester.click('div.border-bottom > button.ant-dropdown-trigger');
        await tester.msleep(1504);
        // Click : 串口
        await tester.click('li.ant-dropdown-menu-item-active');
        await tester.msleep(776);
        // Click : 
        await tester.click('span.ant-input-group-compact > div.ant-select-auto-complete > div.ant-select-selection--single > div.ant-select-selection__rendered > ul > li.ant-select-search--inline > div.ant-select-search__field__wrap > input.ant-select-search__field');
        await tester.msleep(1911);
        // Input : 
        await tester.input('span.ant-input-group-compact > div.ant-select-auto-complete > div.ant-select-selection--single > div.ant-select-selection__rendered > ul > li.ant-select-search--inline > div.ant-select-search__field__wrap > input.ant-select-search__field', '1');
        await tester.msleep(1576);
        // Input : 
        await tester.input('span.ant-input-group-compact > div.ant-select-auto-complete > div.ant-select-selection--single > div.ant-select-selection__rendered > ul > li.ant-select-search--inline > div.ant-select-search__field__wrap > input.ant-select-search__field', '2');
        await tester.msleep(440);
        // Input : 
        await tester.input('span.ant-input-group-compact > div.ant-select-auto-complete > div.ant-select-selection--single > div.ant-select-selection__rendered > ul > li.ant-select-search--inline > div.ant-select-search__field__wrap > input.ant-select-search__field', '3');
        await tester.msleep(385);
        // Click : 确 定
        await tester.click('div.ant-modal-footer > button.ant-btn-primary');
        await tester.msleep(1031);
        // Click : 
        await tester.click('i.anticon-video-camera > svg > path');
        await tester.msleep(1945);
        // Click : 
        await tester.click('textarea.script-content-textarea');
        await tester.msleep(1479);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'Control');
        await tester.msleep(985);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'a');
        await tester.msleep(359);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'x');
        await tester.msleep(544);
        // Click : 
        await tester.click('textarea.script-content-textarea');
        await tester.msleep(1136);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'Control');
        await tester.msleep(240);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'a');
        await tester.msleep(272);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'c');
        await tester.msleep(552);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'c');
        await tester.msleep(208);
        // Input : 
        await tester.input('textarea.script-content-textarea', 'c');
        await tester.msleep(193);
        // Click : 
        await tester.click('textarea.script-content-textarea');
        await tester.msleep(591);
        // Click : 停 止
        await tester.click('button.ant-btn-danger');
        await tester.msleep(689);
        /* actions end */
    });
});