<template>
  <a-row class="request-log-item" ref="requestLogItem">
    <a-col :span="2" class="table-cell">{{source.time | time}}</a-col>
    <a-col :span="4" class="table-cell">{{source.directive.name}}</a-col>
    <a-col :span="2" class="table-cell">
      {{$t(`panel.runMode.requestLog.status.${source.status}`)}}
    </a-col>
        
    <!-- parameters -->
    <a-col :span="8" class="table-cell" style="white-space: nowrap;overflow: hidden;">
      <a-popover placement="topRight">
        <template slot="content">
          <p v-html="getReadableParamData(source, true)"></p>
        </template>
        <span class="btn-data-detail">[{{$t('panel.runMode.requestLog.btnDataDetailShow')}}]</span>
      </a-popover>
      <div class="data request-log-param-data-block">{{getReadableParamData(source)}}</div>
    </a-col>
    
    <!-- response -->
    <a-col :span="8" class="table-cell" style="white-space: nowrap;overflow: hidden;">
      <a-popover placement="topRight">
        <template slot="content">
          <p v-html="getReadableResponseData(source, true)"></p>
        </template>
        <span class="btn-data-detail">[{{$t('panel.runMode.requestLog.btnDataDetailShow')}}]</span>
      </a-popover>
      <div div class="data request-log-response-data-block">{{getReadableResponseData(source)}}</div>
    </a-col>
  </a-row>
</template>
<script>
import Common from '../../utils/Common.js'
import Formatter from '../../utils/Formatter'
export default {
    name: 'BlockPanelLogViewerEntryItem',
    props: {
      /**
       * index of data entry item
       * @property {Number}
       */
      index: {type: Number},
      /**
       * data entry object
       * @property {Object}
       */
      source: {type: Object,default () {return {}}},
    },
    filters : {
        time (value) {
            return Formatter.asTimeDotMS(value);
        },
    },
    methods : {
        /**
         * Get readable parameter data
         * @param {Object} request request log item 
         * @returns {String}
         */
        getReadableParamData( request, renderHtml ) {
            let format = request.executor.customParamFormat;
            let summary = null;
            let handler = `getReadableParamDataFrom` + format[0].toUpperCase() + format.substr(1);
            if ( undefined == this[handler] ) {
                return 'unknown ~~~';
            }

            summary = this[handler](request, renderHtml);
            let formatName = this.$t(`directive.parameter.${format}.name`);
            if ( !renderHtml ) {
                return `[${formatName}] ${summary}`;
            }

            let html = [];
            html.push(formatName);
            if ( 'form' == format ) {
                html = html.concat(summary);
            } else {
                html.push(summary);
            }
            return html.join('<br/>');
        },

        /**
         * generate parameter content from form
         * @param {Object} request
         * @returns {String}
         */
        getReadableParamDataFromForm(request, renderHtml) {
            let paramBuilder = request.executor.getParamBuilder();
            if ( null === paramBuilder ) {
                return 'ERROR';
            }

            let formData = paramBuilder.getBuildHandler().getFormRawData();
            let content = [];
            for ( let i=0; i<formData.length; i++ ) {
                let name = formData[i].name;
                if ( 0 == name.trim().length ) {
                    name = "{"+i+"}";
                }
                let prefix = formData[i].prefix;
                if ( Common.isEmpty(prefix) ) {
                    prefix = '';
                }
                content.push(`${name} = ${prefix}${formData[i].value}`);
            }

            if ( !renderHtml ) {
                content = content.join('; ');
            }

            return content;
        },

        /**
         * generate parameter content from file
         * @param {Object} request
         * @returns {String}
         */
        getReadableParamDataFromNone(request) {
            return '';
        },

        /**
         * generate parameter content from file
         * @param {Object} request
         * @returns {String}
         */
        getReadableParamDataFromFile(request) {
            return request.widget.directiveParams;
        },

        /**
         * generate parameter content from hex
         * @param {Object} request
         * @returns {String}
         */
        getReadableParamDataFromHex(request) {
            return Formatter.asHexString(request.requestData);
        },

        /**
         * generate parameter content from text
         * @param {Object} request
         * @returns {String}
         */
        getReadableParamDataFromText(request) {
            let content = Common.charsetConvert(
                request.requestData,
                'utf-8',
                request.directive.requestCharset
            ).toString();
            return content;
        },

        /**
         * Get readable response data
         * @returns {String}
         */
        getReadableResponseData( request, renderHtml ) {
            if ( Common.isEmpty(request.directive.responseFormatter.fields) ) {
                return Formatter.asHexString(request.responseData);
            }

            let prefixMap = {bin:'0b',oct:'0',dec:'',hex:'0x'};
            let response = request.executor.getResponseAsForm();
            let summary = [];
            let fields = request.directive.responseFormatter.fields;
            for ( let i=0; i<fields.length; i++ ) {
                let name = fields[i].name;
                if ( 0 == name.trim().length ) {
                    name = "{"+i+"}";
                }
                let prefix = '';
                if ( true == this.$dict.voption('DIRECTIVE_PARAM_DATATYPE',fields[i].type,'unsigned', false) ) {
                    prefix = prefixMap[fields[i].format];
                }
                let value = response.getValueByIndex(i);
                if ( undefined == value ) {
                    value = '';
                }
                summary.push(`${name} = ${prefix}${value}`);
            }

            if ( renderHtml ) {
                summary = summary.join('<br/>');
            } else {
                summary = summary.join('; ');
            }
            return summary;
        },
    },
}
</script>
<style scoped>
.request-log-item {border-bottom:solid 1px #bfbfbf;font-size: 0.9em;}
.request-log-item:hover {background: #ebebeb;color: #3c3c3c;}
.request-log-item:nth-child(2n) {background: #f7f6f6;}
.request-log-item .btn-data-detail {float:right;margin-right:0.5em;}
.request-log-item .btn-data-detail:hover {color: #7686e5;}
.request-log-item .data {width: 87%;overflow: hidden;text-overflow: ellipsis;}
</style>