import Excel from 'exceljs'
import MyDate from '../../../utils/datatype/MyDate.js'
/**
 * @method exportAsExcel() export response as excel file.
 */
export default {
    methods : {
        /**
         * Generate excel file by options
         * @param {Object} options options for excel content
         * - columns : {Array}, e.g. [{header:'Name',key:'name'}, ...]
         * - data : {Array}, e.g. [[1,2,3,4],[5,6,7,8], ...]
         */
        async generateResponseExcelFile ( options ) {
            let directive = this.directive;
            let workbook = new Excel.Workbook();
            let worksheet = workbook.addWorksheet(directive.name);
            
            worksheet.columns = options.columns;
            for ( let i=0; i<options.data.length; i++ ) {
                worksheet.addRow(options.data[i]);
            }

            worksheet.getRow(1).font = {bold :true};
            
            let timeKey = MyDate.formatAsDateTimeNumberKey(new Date());
            let name = `${this.directive.name}-${timeKey}.xlsx`;
            let filepath = window.dialog.showSaveDialogSync({ defaultPath: name });
            if ( undefined == filepath ) {
                return;
            }
            
            let buffer = await workbook.xlsx.writeBuffer();
            await window.fs.promises.writeFile(filepath, buffer);

            let folder = window.path.dirname(filepath);
            window.remote.shell.openPath(folder);
        }
    },
}