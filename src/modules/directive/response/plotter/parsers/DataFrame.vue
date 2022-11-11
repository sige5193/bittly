<template>
  <parser-setting-editor>
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
      <!-- header -->
      <a-form-item :label="$t('directive.response.plotter.parserDataFrameHeader')">
        <a-input 
          v-model="options.header" 
          addon-before="0x" 
          :placeholder="$t('messages.exampleContent',['FF AB 01'])"
          @change="actionForceUpdate"
        />
      </a-form-item>

      <!-- data length -->
      <a-form-item :label="$t('directive.response.plotter.parserDataFrameDataLength')">
        <a-row>
          <a-col :span="6">
            <a-switch 
              v-model="options.dynamicLengthEnable" 
              :checked-children="$t('directive.response.plotter.parserDataFrameDynamicLength')" 
              :un-checked-children="$t('directive.response.plotter.parserDataFrameFixedLength')"
              @change="actionForceUpdate"
            />
          </a-col>
          <a-col :span="18">
            <a-input-number 
              v-if="!options.dynamicLengthEnable" 
              class="w-100" 
              v-model="options.dataLength"
              @change="actionForceUpdate"
            ></a-input-number>
            <a-select v-else v-model="options.lengthDatatype" @change="actionForceUpdate">
              <template v-for="(item, itemKey) in $dict.items('DIRECTIVE_PARAM_DATATYPE')">
                <a-select-option 
                  v-if="-1 == ['file','string','bytes'].indexOf(item.value)"
                  :key="itemKey"
                  :value="item.value"
                >{{ $t(`directive.parameter.form.dataType.${item.value}`)}}</a-select-option>
              </template>
            </a-select>
          </a-col>
        </a-row>
      </a-form-item>

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
        
      <!-- tail -->
      <a-form-item :label="$t('directive.response.plotter.parserDataFrameTail')">
        <a-input 
          v-model="options.tail" 
          addon-before="0x" 
          :placeholder="$t('messages.exampleContent',['FF AB 01'])" 
          @change="actionForceUpdate"
        />
      </a-form-item>
    </a-form>
  </parser-setting-editor>
</template>
<script>
import ParserMixin from './ParserMixin.js'
import Common from '../../../../../utils/Common.js'
import MyObject from '../../../../../utils/datatype/MyObject.js';
export default {
    name : 'DirectiveResponsePlotterParserDataFrame',
    mixins : [ParserMixin],
    data() {
        return {
            options : {},
        };
    },
    methods : {
        /**
         * setup options by given value
         */
        setup() {
            this.options = Common.objCopy(this.value);
            MyObject.applyDefaultValues(this.options, {
                header : '',
                tail : '',
                dataType : 'byte',
                lengthDatatype : 'byte',
                channelCount : 1,
                dataLength : 1,
                dynamicLengthEnable : false,
            });
        },

        /**
         * @see {ParserMixin.getUpdatedOptions}
         * @returns {Object}
         */
        getUpdatedOptions() {
            return this.options;
        },
        
        /**
         * parse given data content
         * @param {Uint8Array|null} content
         * @returns {Array}
         */
        parse( content ) {
            if ( null === content ) {
                return 0;
            }
            
            let header = null;
            if ( !Common.isEmpty(this.options.header) ) {
                header = Common.convertStringToHex(this.options.header);
            }

            let tail = null;
            if ( !Common.isEmpty(this.options.tail) ) {
                tail = Common.convertStringToHex(this.options.tail);
            }

            let dataView = Common.convertBufferToDataView(content);
            let cursor = 0;
            while ( cursor < content.length ) {
                let headerEndPos = this.findHeader(header, content, cursor);
                if ( -1 == headerEndPos ) {
                    break;
                }
                cursor = headerEndPos;

                let dataLength = null;
                if ( !this.options.dynamicLengthEnable ) {
                    dataLength = this.options.dataLength;
                } else {
                    dataLength = this.getValueFromDataView(dataView, cursor, this.options.lengthDatatype);
                    cursor += this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',this.options.lengthDatatype, 'length');
                }
                let channeslData  = content.slice(cursor, cursor+dataLength);
                cursor += dataLength;
                
                let tailEndPos = this.matchTail(tail, content, cursor);
                if ( -1 == tailEndPos ) {
                    continue;
                }
                cursor = tailEndPos;

                this.parseChannelData(Buffer.from(channeslData));
            }

            return cursor;
        },


        /**
         * parser channel data
         * @param {Buffer} channeslData
         * @param {Array} channels
         */
        parseChannelData( channeslData, channels ) {
            let dataView = Common.convertBufferToDataView(channeslData);
            let dataLen = this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',this.options.dataType,'length');
            let cursor = 0;
            while ( cursor < dataView.byteLength ) {
                let values = [];
                for ( let ci=0; ci<this.options.channelCount; ci++ ) {
                    let value = this.getValueFromDataView(dataView,cursor, this.options.dataType);
                    cursor += dataLen;
                    values.push(value);
                    if ( cursor >= channeslData.length ) {
                        break;
                    }
                }
                this.channelDataPush(values);
            }
        },

        /**
         * check if tail matched
         * @param {Buffer} tail
         * @param {Buffer} content
         * @param {Number} cursor
         * @returns {Boolean}
         */
        matchTail( tail, content, cursor ) {
            if ( null == tail ) {
                return cursor;
            }

            for ( let i=0; i<tail.length; i++ ) {
                let byte = content[cursor+i];
                if ( byte != tail[i] ) {
                    return -1;
                }
            }
            return cursor + tail.length;
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

        /**
         * find header start pos, if header is emprt, it would returns the current 
         * cursor position.
         * @param {Buffer} header
         * @param {Uint8Array} content
         * @param {Number} cursor
         * @returns {Number}
         */
        findHeader( header, content, cursor ) {
            if ( null == header ) {
                return cursor;
            }

            let pos = cursor;
            while ( pos < content.length  ) {
                let isMatched = true;
                for ( let i=0; i<header.length; i++ ) {
                    let byte = content[pos+i];
                    if ( byte != header[i] ) {
                        isMatched = false;
                        break;
                    }
                }
                if ( isMatched ) {
                    return pos + header.length;
                }
                pos ++;
            }
            return -1;
        }
    },
}
</script>