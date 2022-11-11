<template>
  <parser-setting-editor>
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <!-- data type -->
      <a-form-item :label="$t('directive.response.plotter.parserDataFrameDataType')">
        <a-select v-model="options.dataType" @change="actionForceUpdate">
          <template v-for="(item, itemKey) in $dict.items('DIRECTIVE_PARAM_DATATYPE')">
            <a-select-option 
              v-if="-1 == ['file','string','bytes'].indexOf(item.value)"
              :key="itemKey"
              :value="item.value"
            >{{ $t(`directive.parameter.form.dataType.${item.value}`)}}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <!-- channel count -->
      <a-form-item :label="$t('directive.response.plotter.parserDataFrameChannelCount')">
        <a-input-number 
          class="w-100" 
          v-model="options.channelCount" 
          @change="actionForceUpdate"
        ></a-input-number>
      </a-form-item>
    </a-form>
  </parser-setting-editor>
</template>
<script>
import ParserMixin from './ParserMixin.js'
import Common from '../../../../../utils/Common.js'
export default {
    name : 'DirectiveResponsePlotterParserDataMatrix',
    mixins : [ParserMixin],
    data() {
        return {
            /**
             * options for data martix parser.
             * @property {Object}
             */
            options : {},
        };
    },
    methods : {
        /**
         * setup options by given value
         */
        setup() {
            this.options = Common.objCopy(this.value);
            this.options.dataType = this.value.dataType || 'byte';
            this.options.channelCount = 1;
            if ( undefined != this.value.channelCount ) {
                this.options.channelCount = this.value.channelCount;
            }
        },

        /**
         * @see {ParserMixin.getUpdatedOptions}
         * @returns {Object}
         */
        getUpdatedOptions() {
            return this.options;
        },

        /**
         * parse given data content to channel data and returns the length of 
         * parserd data.
         * @param {Buffer} content
         * @returns {Number}
         */
        parse( content ) {
            if ( null === content ) {
                return 0;
            }
            
            let dataView = Common.convertBufferToDataView(content);
            let dataLen = this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',this.options.dataType,'length');
            let cursor = 0;
            while ( cursor < dataView.byteLength ) {
                let values = [];
                let batchCursor = cursor;
                for ( let ci=0; ci<this.options.channelCount; ci++ ) {
                    let value = this.getValueFromDataView(dataView, batchCursor, this.options.dataType);
                    values.push(value);
                    batchCursor += dataLen;
                    if ( batchCursor >= content.length ) {
                        break;
                    }
                }

                if ( values.length == this.options.channelCount ) {
                    cursor = batchCursor;
                    this.channelDataPush(values);
                } else {
                    break;
                }
            }

            return cursor;
        },
        
        /**
         * get value from data view
         * @param {DataView} dataView
         * @param {Number} cursor
         * @param {String} dataType
         * @returns {Number}
         */
        getValueFromDataView( dataView, cursor, dataType ) {
            let getter =  {
                byte : 'getUint8',
                char_int : 'getInt8',
                char : 'getInt8',
                unsigned_char : 'getUint8',
                short : 'getInt16',
                unsigned_short : 'getUint16',
                int : 'getInt32',
                unsigned_int : 'getUint32',
                long : 'getInt32',
                unsigned_long : 'getUint32',
                long_long : 'getBigInt64',
                unsigned_long_long : 'getBigUint64',
                float : 'getFloat32',
                double : 'getFloat64'
            }[dataType];
            let isLittleEndian = this.directive.endianness == 'little-endian';
            return dataView[getter](cursor, isLittleEndian);
        },
    },
}
</script>