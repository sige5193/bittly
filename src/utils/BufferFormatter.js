import Dictionary from './Dictionary.js'
class BufferFormatter {
    /**
     * @param {*} type 
     */
    static toReadableString( buffer, type ) {
        if ( null == buffer ) {
            return '';
        }
        
        if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['STRING','CHAR','UNSIGNED_CHAR'], type) ) {
            return buffer.toString();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['FLOAT','DOUBLE'], type) ) {
            let view = new DataView(buffer);
            let length = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',type,'length',4) * 8;
            let getter = `getFloat${length}`;
            return view[getter]();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['UNSIGNED_SHORT','UNSIGNED_INT', 'UNSIGNED_LONG'], type) ) {
            let view = new DataView(buffer);
            let length = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',type,'length',4) * 8;
            let getter = `getUint${length}`;
            return view[getter]();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['BYTE_SIGNED','SHORT','INT', 'LONG'], type) ) {
            let view = new DataView(buffer);
            let length = Dictionary.voption('DIRECTIVE_PARAM_DATATYPE',type,'length',4) * 8;
            let getter = `getInt${length}`;
            return view[getter]();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['LONG_LONG'], type) ) {
            let view = new DataView(buffer);
            return view.getBigInt64();
        } else if ( Dictionary.match('DIRECTIVE_PARAM_DATATYPE',['UNISNGED_LONG_LONG'], type) ) {
            let view = new DataView(buffer);
            return view.getBigUint64();
        } else {
            return buffer.toString('hex').toUpperCase();
        }
    }
}
export default BufferFormatter;