import Common from '@/utils/Common.js';
import ParameterBuilder from '../Builder.js'
export default class BuildHandler {
    /**
     * construct of build handler
     * @param {ParameterBuilder} builder 
     */
    constructor( builder ) {
        this.builder = builder;
    }

    /**
     * get builder name
     * @returns {String}
     */
    getTypeName() {
        return 'file';
    }

    /**
     * get preprocessed parameter data
     * @return {String}
     */
    getPreProcessedData() {
        let filepath = this.builder.paramContent.path;
        if ( Common.isEmpty(filepath) ) {
            throw Error(window.app.$t('directive.parameter.file.filepathCannotBeEmpty'));
        }
        
        try {
            window.fs.accessSync(filepath, window.fs.constants.R_OK);
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.file.filepathUnableToRead',[filepath]));
        }

        let fileContent = null;
        try {
            fileContent = window.fs.readFileSync(filepath);
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.file.readFailed',[filepath, e.message]));
        }

        // build content
        let contentHandler = `getSendContentBy${this.builder.paramContent.sendMode}`;
        let content = this[contentHandler](fileContent);
        return content;
    }

    /**
     * get send content by bytes
     * @param {*} fileContent 
     */
    getSendContentByBytes( fileContent ) {
        let lineIndex = this.builder.directive.statusGet('ParamFileCurLine', 1) - 1;
        let byteCount = this.builder.paramContent.byteCount;
        let startPos = lineIndex * byteCount;
        
        if ( startPos >= fileContent.length ) {
            if ( 'BackToHead' == this.builder.paramContent.afterSendAll ) {
                startPos = 0;
                lineIndex = 0;
            }
        }
        
        if ( startPos >= fileContent.length ) {
            throw Error(window.app.$t('directive.parameter.file.sendModelLineOutOfContent'));
        }

        let content = fileContent.slice(startPos, startPos+byteCount);
        this.builder.directive.statusSet('ParamFileCurLine', lineIndex+2);
        return content;
    }

    /**
     * get send content by line.
     * @param {*} fileContent 
     * @returns 
     */
    getSendContentByLine( fileContent ) {
        let newline = this.builder.paramContent.newLineStyle;
        newline = newline.replace('CR',"\r").replace('LF',"\n");

        let lineIndex = this.builder.directive.statusGet('ParamFileCurLine', 1) - 1;
        let lines = fileContent.toString().split(newline);
        if ( lineIndex >= lines.length ) {
            if ( 'BackToHead' == this.builder.paramContent.afterSendAll ) {
                lineIndex = 0;
            }
        }
        
        if ( lineIndex >= lines.length ) {
            throw Error(window.app.$t('directive.parameter.file.sendModelLineOutOfContent'));
        }

        this.builder.directive.statusSet('ParamFileCurLine', lineIndex+2);
        return lines[lineIndex].trim();
    }

    /**
     * get send content with all file content
     * @param {Buffer} fileContent 
     * @returns 
     */
    getSendContentByAll( fileContent ) {
        return fileContent;
    }

    /**
     * get request buffer data from content
     * @returns {Buffer}
     */
    buildBuffer() {
        let content = this.getPreProcessedData();
        let buffer = Buffer.from(content);
        return buffer;
    }
}