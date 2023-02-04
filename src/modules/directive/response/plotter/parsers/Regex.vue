<template>
  <parser-setting-editor>
    <a-form>
      <!-- pattern -->
      <a-form-item :label="$t('directive.response.plotter.parserRegexPattern')">
        <a-textarea 
          placeholder="temp=(?P<temp>[\d\.]+)\sheight=(?P<height>\d+)" 
          v-model="options.pattern"
          :auto-size="{minRows:3}"
          @input="actionExecutePattern"
          @change="actionForceUpdate"
        ></a-textarea>
      </a-form-item>
      
      <!-- example data -->
      <a-form-item :label="$t('directive.response.plotter.parserRegexExampleData')">
        <a-textarea 
          placeholder="temp=30.22 height=12" 
          v-model="exampleContent"
          :auto-size="{minRows:3}"
          @input="actionExecutePattern"
        ></a-textarea>
      </a-form-item> 
      
      <!-- output channels -->
      <a-form-item 
        v-if="undefined !== options.pattern && 0 < options.pattern.trim().length && 0 < exampleContent.trim().length"
        :label="$t('directive.response.plotter.parserRegexExampleMatch')"
      > 
        <div v-if="null !== regexErrorMessage" class="bg-light p-1">
          {{$t('directive.response.plotter.parserRegexRegexIsNotAvailable')}} <br/>
          {{regexErrorMessage}}
        </div>
        <a-empty v-else-if="0 === Object.keys(exampleMatched).length"
          :description="false"
        ></a-empty>
        <ul v-else class="bg-light" style="line-height:2em">
          <li v-for="(matchValues,matchKey) in exampleMatched" :key="matchKey">
            {{matchKey}} : {{matchValues.join(', ')}}
          </li>
        </ul>
      </a-form-item>
    </a-form>
  </parser-setting-editor>
</template>
<script>
import MyObject from '../../../../../utils/datatype/MyObject.js';
import ParserMixin from './ParserMixin.js'
export default {
    name : 'DirectiveResponsePlotterParserRegex',
    mixins : [ParserMixin],
    data() {
        return {
            options : {},
            /**
             * example to test regex pattern
             * @property {String}
             */
            exampleContent : '',
            /**
             * matched result for example data
             * @property {Array<Object>}
             */
            exampleMatched : {},
            /**
             * error message on regex error
             * @property {String|null}
             */
            regexErrorMessage : null,
        };
    },
    methods : {
        /**
         * setup options by given value
         */
        setup() {
            this.options = MyObject.copy(this.value);
            MyObject.applyDefaultValues(this.options, {
                pattern : '',
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
         * execute regex pattern
         */
        actionExecutePattern() {
            this.exampleMatched = {};
            this.regexErrorMessage = null;
            if ( undefined === this.options.pattern || 0 === this.options.pattern.trim().length ) {
                return ;
            }

            let pattern = this.options.pattern;
            let regex = null;
            try {
                regex = new RegExp(`^${pattern}`);
            } catch (e) {
                this.regexErrorMessage = e.message;
                return ;
            }

            if ( 0 === this.exampleContent.trim().length ) {
                return ;
            }
            let match = null;
            let content = this.exampleContent;
            while ((match = regex.exec(content)) !== null) {
                if ( 0 === match[0].length ) {
                    break ;
                }
                content = content.substring(match[0].length);
                for ( let groupKey in match.groups ) {
                    if ( undefined === this.exampleMatched[groupKey] ) {
                        this.exampleMatched[groupKey] = [];
                    }
                    this.exampleMatched[groupKey].push(match.groups[groupKey]);
                }
            }
        },
        
        /**
         * parse given data content
         * @param {Uint8Array|null} content
         * @returns {Array}
         */
        parse( content ) {
            if ( null === content || 0 === content.length ) {
                return 0;
            }

            let parsedLength = 0;
            let regex = new RegExp(`^${this.options.pattern}`);
            let contentText = content.toString();
            let match = null;
            while ((match = regex.exec(contentText)) !== null) {
                if ( 0 === match[0].length ) {
                    break ;
                }

                parsedLength += match[0].length;
                contentText = contentText.substring(match[0].length);
                this.channelNames = Object.keys(match.groups);
                let values = [];
                for ( let groupKey in match.groups ) {
                    values.push(match.groups[groupKey]);
                }
                this.channelDataPush(values);
            }

            return parsedLength;
        },
    },
}
</script>