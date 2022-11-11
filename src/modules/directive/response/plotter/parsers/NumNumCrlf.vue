<template>
  <parser-setting-editor :enable="false" />
</template>
<script>
import ParserMixin from './ParserMixin.js'
export default {
    name : 'DirectiveResponsePlotterParserNumNumCrlf',
    mixins : [ParserMixin],
    methods : {
        /**
         * parse given data content
         * @param {Uint8Array|null} content
         * @returns {Array}
         */
        parse( content ) {
            if ( null == content ) {
                return 0;
            }
        
            let str = content.toString();
            let cursor = 0;
            do {
                let pos = str.indexOf("\r\n");
                if ( -1 == pos ) {
                    break;
                }
                let line = str.substring(0, pos);
                str = str.substring(pos+2);
                cursor += pos + 2;
                if ( 0 == line.length ) {
                    continue;
                }

                let values = line.split(' ');
                for ( let i=0; i<values.length; i++ ) {
                    values[i] = values[i]*1;
                }
                this.channelDataPush(values);
            } while ( 0 < str.length );
            return cursor;
        },
    }
}
</script>