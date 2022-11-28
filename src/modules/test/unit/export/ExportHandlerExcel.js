import Excel from 'exceljs'
export default class ExcelExportor {
    /**
     * constructor of exportor
     */
    constructor( exportor ) {
        this.exportor = exportor;
        this.workbook = null;
    }

    /**
     * set title of test report, this method does not work on excel exportor
     * @param {*} title 
     */
    setTitle( title ) {}

    /**
     * execute exporting
     */
    run() {
        this.workbook = new Excel.Workbook();
        let sheetName = window.app.$t('test.exportExcel.sheetName');
        let worksheet = this.workbook.addWorksheet(sheetName);
        worksheet.columns = [
            { header: window.app.$t('test.exportExcel.headerDirectiveName'), key: 'dname' },
            { header: window.app.$t('test.exportExcel.headerTestcaseName'), key: 'tcname' },
            { header: window.app.$t('test.exportExcel.headerStatus'), key: 'status' },
            { header: window.app.$t('test.exportExcel.headerParamsFormat'), key: 'pformat' },
            { header: window.app.$t('test.exportExcel.headerParamsContent'), key: 'params' },
            { header: window.app.$t('test.exportExcel.headerExpectResponseFormat'), key: 'rformat' },
            { header: window.app.$t('test.exportExcel.headerExpectResponseContent'), key: 'ercontent' },
            { header: window.app.$t('test.exportExcel.headerActualResponseContent'), key: 'arcontent' },
        ];

        let directiveKeys = Object.keys(this.exportor.directives);
        for ( let i=0; i<directiveKeys.length; i++ ) {
            let dirkey = directiveKeys[i];
            let item = this.exportor.directives[dirkey];
            if ( 0 == item.testcases.length ) {
                continue;
            }
            
            for ( let ti=0; ti<item.testcases.length; ti++ ) {
                let testcaseItem = item.testcases[ti];
                let status = 'success' == testcaseItem.status
                    ? app.$t('test.testcaseExecuteStatusPass')
                    : app.$t('test.testcaseExecuteStatusNotPass');
                let paramFormat = app.$t(`directive.requestParam.type.${testcaseItem.testcase.paramFormat}`);
                let expectFormat = app.$t(`directive.requestParam.type.${testcaseItem.testcase.expectFormat}`);

                worksheet.addRow({
                    dname : item.directive.name,
                    tcname : testcaseItem.testcase.title,
                    status : status,
                    pformat : paramFormat,
                    params : this.generateContentRequestParam(testcaseItem),
                    rformat : expectFormat,
                    ercontent : this.generateContentExpectResponse(testcaseItem),
                    arcontent : this.generateContentActualResponse(testcaseItem)
                });
            }
        }

        worksheet.getRow(1).font = {bold :true};
    }

    /**
     * generate actual response content
     * @param {*} testcaseItem 
     */
    generateContentActualResponse(testcaseItem) {
        if ( null == testcaseItem.result ) {
            return '';
        }

        if ( 'string' == testcaseItem.testcase.expectFormat ) {
            return testcaseItem.result;
        } else if ( 'hex' == testcaseItem.testcase.expectFormat ) {
            return testcaseItem.result;
        } else if ( 'form' == testcaseItem.testcase.expectFormat ) {
            if ( undefined == testcaseItem.testcase.expect.value ) {
                return '';
            }
            let params = [];
            for ( let i=0; i<testcaseItem.testcase.expect.value.length; i++ ) {
                let param = testcaseItem.testcase.expect.value[i];
                let operator = window.app.$t(`test.editModal.comparator${param.comparator}`);
                let value = testcaseItem.result.getValueByIndex(i);
                if ( undefined === value ) {
                    value = window.app.$t('test.valueEmpty');
                }
                let pcontent = this.exportor.generateFormItemDataString({
                    index : i,
                    name : param.name,
                    type : param.type,
                    prefix : param.prefix,
                    value : `(${value} ${operator} ${param.value})`,
                });
                params.push(pcontent);
            }
            return params.join('\n');
        }
    }

    /**
     * generate expect response content
     * @param {*} testcaseItem 
     */
    generateContentExpectResponse( testcaseItem ) {
        if ( 'string' == testcaseItem.testcase.expectFormat ) {
            if ( undefined == testcaseItem.testcase.expect.value ) {
                return '';
            }
            return testcaseItem.testcase.expect.value;
        } else if ( 'hex' == testcaseItem.testcase.expectFormat ) {
            if ( undefined == testcaseItem.testcase.expect.value ) {
                return '';
            }
            return testcaseItem.testcase.expect.value;
        } else if ( 'form' == testcaseItem.testcase.expectFormat ) {
            if ( undefined == testcaseItem.testcase.expect.value ) {
                return '';
            }
            let params = [];
            for ( let i=0; i<testcaseItem.testcase.expect.value.length; i++ ) {
                let param = testcaseItem.testcase.expect.value[i];
                let pcontent = this.exportor.generateFormItemDataString({
                    index : i,
                    name : param.name,
                    type : param.type,
                    prefix : param.prefix,
                    value : param.value,
                });
                params.push(pcontent);
            }
            return params.join('\n');
        }
    }

    /**
     * generate request parameter content
     * @param {Object} testcaseItem
     * @returns {String}
     */
    generateContentRequestParam( testcaseItem ) {
        if ( 'string' == testcaseItem.testcase.paramFormat ) {
            return testcaseItem.testcase.params.value;
        } else if ( 'hex' == testcaseItem.testcase.paramFormat ) {
            return testcaseItem.testcase.params.value;
        } else if ( 'form' == testcaseItem.testcase.paramFormat ) {
            let params = [];
            for ( let i=0; i<testcaseItem.testcase.params.value.length; i++ ) {
                let param = testcaseItem.testcase.params.value[i];
                let paramContent = this.exportor.generateFormItemDataString({
                    index : i,
                    name : param.name,
                    type : param.type,
                    prefix : param.prefix,
                    value : param.value,
                });
                params.push(paramContent);
            }
            return params.join('\n');
        }
    }

    /**
     * save file
     * @param {*} path 
     */
    async save( path ) {
        path += '.xlsx';
        let buffer = await this.workbook.xlsx.writeBuffer();
        await window.fs.promises.writeFile(path, buffer);
    }
}