<template>
  <parser-setting-editor :bodyStyle="{padding:0}">
    <!-- field table -->
    <a-table :columns="fieldConfigColumns" :data-source="fields" size="small" :pagination="false">
      <div slot="enable" slot-scope="text,record">
        <a-switch v-model="record.enable" size="small"/>
      </div>
      <div slot="label" slot-scope="text">
        {{text}}
      </div>
      <div slot="expression" slot-scope="text,record">
        <a-input v-model="record.expression" size="small"/>
      </div>
    </a-table>

    <!-- ext actions -->
    <template slot="extActions">
      <a-button @click="actionConfigRefresh">{{$t('button.refresh')}}</a-button>
    </template>
  </parser-setting-editor>
</template>
<script>
import ResponseParser from '../../form/ResponseParser.js'
import Common from '../../../../../utils/Common.js'
import ParserMixin from './ParserMixin.js'
import MyNumber from '../../../../../utils/datatype/MyNumber.js'
export default {
    name : 'DirectiveResponsePlotterParserForm',
    mixins : [ParserMixin],
    data() {
        return {
            /**
             * @property {Array<Object>}
             */
            fieldConfigColumns : [
                {title:this.$t('directive.response.plotter.parserFormFieldEnable'), dataIndex: 'enable', scopedSlots: { customRender: 'enable' }},
                {title:this.$t('directive.response.plotter.parserFormFieldName'), dataIndex: 'label', scopedSlots: { customRender: 'label' }},
                {title:this.$t('directive.response.plotter.parserFormFieldExpression'), dataIndex: 'expression', scopedSlots: { customRender: 'expression' }},
            ],
            /**
             * list of fields to render
             * @property {String[]}
             */
            fields : [],
        };
    },
    methods : {
        /**
         * @see {ParserMixin.setup}
         */
        setup() {
            this.fields = [];
            if ( undefined !== this.value.form ) {
                this.fields = Common.objCopy(this.value.form);
            }
            if ( 0 == this.fields.length ) {
                this.actionConfigRefresh();
            }
        },

        /**
         * refresh configurations
         */
        actionConfigRefresh() {
            this.fields = [];
            if ( undefined === this.directive.responseFormatter.fields ) {
                return ;
            }

            for ( let i=0; i<this.directive.responseFormatter.fields.length; i++ ) {
                let field = this.directive.responseFormatter.fields[i];
                let option = {};
                option.key = i;
                option.enable = false;
                option.expression = '{{value}}';
                option.label = field.name;
                option.getter = field.name;
                if ( 0 == field.name.trim().length ) {
                    option.label = `$${i+1}`;
                    option.getter = `${i+1}`;
                }
                this.fields.push(option);
            }
        },

        /**
         * @see {ParserMixin.getUpdatedOptions}
         * @returns {Object}
         */
        getUpdatedOptions() {
            let options = Common.objCopy(this.value);
            options.form = Common.objCopy(this.fields);
            return options;
        },
        
        /**
         * parse given data content
         * @param {Uint8Array|null} content
         * @returns {Array}
         */
        parse( content ) {
            if ( null === content || undefined === this.directive.responseFormatter.fields ) {
                return 0;
            }
            
            if ( null === this.channelNames ) {
                this.channelNames = [];
                for ( let i=0; i<this.fields.length; i++ ) {
                    let field = this.fields[i];
                    if ( ! field.enable ) {
                        continue;
                    }
                    this.channelNames.push(field.label);
                }
            }

            // parser content to value list
            let parser = new ResponseParser(this.directive, content, false);
            let result = parser.parseToLastCompleteMatch();
            
            let valuesList = result.valuesList;
            let formatFields = this.directive.responseFormatter.fields;
            for ( let i=0; i<valuesList.length; i++ ) {
                let values = [];
                for ( let fi=0; fi<this.fields.length; fi++ ) {
                    let field = this.fields[fi];
                    if ( !field.enable ) {
                        continue;
                    }

                    let value = valuesList[i][fi];
                    value = this.convertFieldValueToNumber(formatFields[fi], value);
                    value = this.executeFieldExpression(field, value);
                    values.push(value);
                }
                this.channelDataPush(values);
            }

            return result.endpos;
        },

        /**
         * execute field expression
         */
        executeFieldExpression(field, value) {
            try {
                let expression = field.expression.replaceAll('{{value}}', value);
                let exprFunc = Function(`return ${expression};`);
                let exprValue = exprFunc.call({});
                return exprValue * 1;
            } catch ( e ) {
                throw Error(window.app.$t('directive.response.plotter.parserFormFieldExpressionFailed', [field.label, field.expression, e.message]));
            }
        },

        /**
         * convert field value to number
         * @returns {Number}
         */
        convertFieldValueToNumber( field, value ) {
            let rawNumTypes = [
                'char', 'short', 'char_int', 'int', 'long',
                'long_long', 'float','double', 'string'
            ];
            if ( -1 !== rawNumTypes.indexOf(field.type) ) {
                return Number(value);
            }

            if ( 'bytes' === field.type ) {
                return 0;
            }
            
            return MyNumber.parseNumberByRadixName(value, field.format);
        },
    },
}
</script>