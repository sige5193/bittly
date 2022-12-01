import MdbProject from '../../../../models/MdbProject.js'
import Dictionary from '../../../../utils/Dictionary.js'
import ExportHandlerHtml from "./ExportHandlerHtml.js";
import ExportHandlerExcel from "./ExportHandlerExcel.js";
import MdbDirective from '../../../../models/MdbDirective.js';
export default class Exportor {
    /**
     * constructor of Exportor
     */
    constructor() {
        this.directives = {};
    }

    /**
     * log directive
     * @param {MdbDirective} directive 
     */
    logDirective( directive ) {
        let data = directive.getData();
        this.directives[directive.id] = {
            directive : data,
            testcases : [],
        };
    }

    /**
     * log testcase
     * @param {*} directiveId 
     * @param {*} testcase 
     */
    logTestcase( directiveId, testcase, result, status ) {
        this.directives[directiveId].testcases.push({
            testcase : testcase.getData(),
            result : result,
            status : status,
        });
    }

    /**
     * export test result
     * @param {*} format 
     */
    async export( format ) {
        let project = await MdbProject.findOne(window.app.$store.getters.projectActivedId);
        let time = new Date();
        let timeString = [];
        timeString.push(time.getFullYear());
        timeString.push((9>time.getMonth()) ? `0${time.getMonth()+1}` : (time.getMonth()+1));
        timeString.push((10>time.getDate()) ? `0${time.getDate()}` : time.getDate());
        timeString.push( (10>time.getHours()) ? `0${time.getHours()}` : time.getHours() );
        timeString.push( (10>time.getMinutes()) ? `0${time.getMinutes()}` : time.getMinutes() );
        timeString.push( (10>time.getSeconds()) ? `0${time.getSeconds()}` : time.getSeconds() );
        timeString = timeString.join('');
        let filename = window.app.$t('test.testResultReportName',[project.name, timeString]);
        let filepath = window.dialog.showSaveDialogSync({ defaultPath: filename });
        if ( undefined == filepath ) {
            return;
        }

        let generator = null;
        if ( 'html' == format ) {
            generator = new ExportHandlerHtml(this);
        } else if ( 'excel' == format ) {
            generator = new ExportHandlerExcel(this);
        }
        await generator.run();
        generator.setTitle(filename);
        await generator.save(filepath);
        window.app.$message.success(window.app.$t('messages.fileSaveSuccess'));
    }

    /**
     * generate string content of form data item.
     * @param {Object} options
     * - index : {Number} index of item
     * - name : {String} name of item
     * - type : {String} type of data
     * - prefix : {String} prefix of data value
     * - value : {String} value of item
     * @returns {String}
     */
    generateFormItemDataString( options ) {
        let name = options.name;
        if ( 0 == name.trim().length ) {
            name = '$' + options.index
        }
        
        let type = window.app.$t(`directive.parameter.form.dataType.${options.type}`);

        let prefix = options.prefix;
        if ( false == Dictionary.voption('DIRECTIVE_PARAM_DATATYPE', options.type, 'unsigned', false) ) {
            prefix = '';
        }
        
        let value = options.value;
        if ( undefined == value ) {
            value = window.app.$t('test.valueEmpty');
        }
        return `${name} [${type}] : ${prefix}${value}`;
    }
}