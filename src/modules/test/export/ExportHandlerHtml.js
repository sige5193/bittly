import Dictionary from '../../../utils/Dictionary.js'
import MdbProject from '../../../models/MdbProject.js'
export default class ExportHandlerHtml {
    /**
     * constructor of html export handler
     */
    constructor( exportor ) {
        this.exportor = exportor;
        this.content = [];
        this.title = '';
    }

    /**
     * set title of report
     * @public
     * @param {String} title 
     */
    setTitle( title ) {
        this.title = title;
    }

    /**
     * execute generation
     * @public
     */
    async run() {
        this.content.push('<!doctype html>');
        this.content.push('<html lang="zh-CN">');
        this.content.push('<head>');
        this.content.push('<meta charset="utf-8">');
        this.content.push(`<title>${this.title}</title>`);
        this.content.push('</head>');
        this.content.push('<body>');

        let project = await MdbProject.findOne(window.app.$store.getters.projectActivedId);
        let time = new Date();
        let timeString = [];
        timeString.push(time.getFullYear());
        timeString.push('-');
        timeString.push((9>time.getMonth()) ? `0${time.getMonth()+1}` : (time.getMonth()+1));
        timeString.push('-');
        timeString.push((10>time.getDate()) ? `0${time.getDate()}` : time.getDate());
        timeString.push(' ');
        timeString.push( (10>time.getHours()) ? `0${time.getHours()}` : time.getHours() );
        timeString.push(':');
        timeString.push( (10>time.getMinutes()) ? `0${time.getMinutes()}` : time.getMinutes() );
        timeString.push(':');
        timeString.push( (10>time.getSeconds()) ? `0${time.getSeconds()}` : time.getSeconds() );
        timeString = timeString.join('');
        let filename = window.app.$t('test.testResultReportName',[project.name, timeString]);
        this.content.push(`<h1>${filename}</h1>`);

        this.generateContent();
        
        this.content.push('</body>');
        this.content.push('</html>');
    }

    /**
     * generate content
     * @private
     */
    generateContent() {
        let app = window.app;
        this.content.push('<table border="1">');
        this.content.push('<thead>');
        this.content.push('<tr>');
        this.content.push(`<th>${app.$t('test.exportHtml.headerDirectiveName')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerTestcaseName')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerStatus')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerParamsFormat')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerParamsContent')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerExpectResponseFormat')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerExpectResponseContent')}</th>`);
        this.content.push(`<th>${app.$t('test.exportHtml.headerActualResponseContent')}</th>`);
        this.content.push('</tr>');
        this.content.push('</thead>');
        this.content.push('<tbody>');

        let directiveKeys = Object.keys(this.exportor.directives);
        for ( let i=0; i<directiveKeys.length; i++ ) {
            let dirkey = directiveKeys[i];
            let item = this.exportor.directives[dirkey];
            if ( 0 == item.testcases.length ) {
                continue;
            }
            
            for ( let ti=0; ti<item.testcases.length; ti++ ) {
                let testcaseItem = item.testcases[ti];
                this.content.push('<tr>');
                if ( 0 == ti ) {
                    this.content.push(`<td rowspan="${item.testcases.length}">${item.directive.name}</td>`);
                }
                this.content.push(`<td>${testcaseItem.testcase.title}</td>`);
                
                let status = 'success' == testcaseItem.status
                    ? app.$t('test.testcaseExecuteStatusPass')
                    : app.$t('test.testcaseExecuteStatusNotPass');
                this.content.push(`<td>${status}</td>`);
                
                let paramFormat = app.$t(`directive.requestParam.type.${testcaseItem.testcase.paramFormat}`);
                this.content.push(`<td>${paramFormat}</td>`);
                this.content.push(`<td>${this.generateContentRequestParam(testcaseItem)}</td>`);

                let expectFormat = app.$t(`directive.requestParam.type.${testcaseItem.testcase.expectFormat}`);
                this.content.push(`<td>${expectFormat}</td>`);
                this.content.push(`<td>${this.generateContentExpectResponse(testcaseItem)}</td>`);

                this.content.push(`<td>${this.generateContentActualResponse(testcaseItem)}</td>`);
                this.content.push('</tr>');
            }
        }

        this.content.push('</tbody>');
        this.content.push('</table>');
    }

    /**
     * generate content from actual response
     * @param {MdbTestcase} testcaseItem 
     * @returns {String}
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
                params.push(`<div>${pcontent}</div>`);
            }
            return params.join('\n');
        }
    }

    /**
     * generate content from expect response
     * @param {MdbTestcase} testcaseItem 
     * @returns {String}
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
                params.push(`<div>${pcontent}</div>`);
            }
            return params.join('\n');
        }
    }

    /**
     * generate content from request param
     * @param {MdbTestcase} testcaseItem 
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
                let pcontent = this.exportor.generateFormItemDataString({
                    index : i,
                    name : param.name,
                    type : param.type,
                    prefix : param.prefix,
                    value : param.value,
                });
                params.push(`<div>${pcontent}</div>`);
            }
            return params.join('\n');
        }
    }

    /**
     * save content to file.
     * @param {String} path 
     */
    async save( path ) {
        path += '.html';
        let content = this.content.join("\n");
        await window.fs.promises.writeFile(path, content);
    }
}