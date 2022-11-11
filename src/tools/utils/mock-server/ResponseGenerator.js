/**
 * @author sige
 */
import { faker } from '@faker-js/faker';
import Common from '../../../utils/Common.js'
import ResponseScriptRuntime from './ResponseScriptRuntime.js'
export default class ResponseGenerator {
    /**
     * @param {Object} options 
     */
    constructor ( options, requestData ) {
        this.options = options;
        this.requestData = requestData;
    }

    /**
     * @param {*} name 
     * @returns 
     */
    generateByHandlerName( name ) {
        let handler = `generateBy` + name[0].toUpperCase() + name.substr(1);
        return this[handler]();
    }

    /**
     * generate response from echo
     */
    generateByEcho() {
        let data = {};
        data.mode = 'hex';
        data.content = this.requestData.toString('hex').toUpperCase();
        data.note = `${this.$t('app.tool.responseHandlerEcho')}`;
        return data;
    }

    /**
     * generate response from script
     */
    generateByScript() {
        let $this = new ResponseScriptRuntime(this.requestData, this.options);
        try {
            let func = new Function('$this',this.options.script);
            func($this);
            if ( null != $this.mode && null != $this.responseData ) {
                let data = {};
                data.mode = $this.mode;
                data.content = $this.responseData;
                data.note = `${this.$t('app.tool.responseHandlerScript')}`;
                return data;
            }
        } catch ( e ) {
            window.app.$message.error(this.$t('app.tool.scriptExecuteFailed', [e.message]));
        }
    }

    /**
     * generate response from random
     */
    generateByRandom() {
        let template = this.options.randomTemplate;
        if ( 0 == template.trim().length ) {
            template = '{{random.alphaNumeric}}';
        }
        
        let response = this.generateFakeContentFromTemplate(template);
        let data = {};
        data.mode = this.options.mode;
        data.content = response;
        data.note = `${this.$t('app.tool.responseHandlerRandom')}`;
        return data;
    }

    /**
     * Generate response by given rules
     * @returns 
     */
    generateByMatch() {
        this.log('auto response match rule start ...', this.requestData);
        let response = null;

        for ( let i=0; i<this.options.matchRules.length; i++ ) {
            let rule = this.options.matchRules[i];
            if ( !rule.enable ) {
                this.log(`rule #${i} disabled`);
                continue ;
            }
                
            let content = null;
            if ( 'text' === rule.mode ) {
                content = Common.charsetConvert(this.requestData, 'utf8', this.options.charset).toString();
            } else {
                content = this.requestData.toString('hex').toUpperCase();
            }
            
            let regex = this.compileMatcRuleTemplateToRegex(rule);
            if ( false === regex ) {
                break;
            }

            let match = content.match(regex);
            if ( null == match ) {
                this.log(`rule #${i} match failed`);
                continue;
            }

            this.log(`rule #${i} matched`, match);
            let responseData = rule.response;
                
            // replace index placeholder
            for ( let mi=0; mi<match.length; mi++ ) {
                responseData = responseData.replaceAll(`{{${i}}}`, match[i]);
            }
            
            // replace groups
            if ( undefined != match.groups ) {
                for ( let matchGroupKey in match.groups ) {
                    responseData = responseData.replaceAll(`{{${matchGroupKey}}}`, match.groups[matchGroupKey]);
                }
            }

            response = {};
            response.mode = rule.mode;
            response.content = this.generateFakeContentFromTemplate(responseData);
            response.note = `${this.$t('app.tool.responseHandlerMatch')} : ${rule.note ? rule.note : '' }`;
            break;
        }
        this.log('auto response match rule end');
        return response;
    }

    /**
     * compile match template to regex
     * @param {Object} rule
     * @returns {Regex|false}
     */
    compileMatcRuleTemplateToRegex( rule ) {
        let template = rule.template;
        let regex = null;
        
        // in hex mode, we need to ignore case sensitive in template, but group name does not.
        // so we uppercase the template without group names.
        if ( 'hex' === rule.mode ) {
            template = template.replaceAll(/\s/g,'');
            
            let groups = [];
            let groupMatchIter = template.matchAll(/\?<(.*?)>/g);
            let groupMatchItem = null;
            do {
                groupMatchItem = groupMatchIter.next();
                if ( true == groupMatchItem.done ) {
                    break;
                }
                groups.push(groupMatchItem.value);
            } while ( false == groupMatchItem.done );
            
            template = template.toUpperCase();
            for ( let i=0; i<groups.length; i++ ) {
                let key = groups[i][0].toUpperCase();
                template = template.replace(key,groups[i][0]);
            }
        }

        try {
            regex = new RegExp(`^${template}$`);
            return regex;
        } catch (e) {
            console.log(`rule template '${template}' not available`);
            window.app.$message.error(this.$t('app.tool.regexIsNotAvailable', [e.message]));
            return false;
        }
    }

    /**
     * generate fake content from template
     * @param {String} template
     * @returns {String}
     */
    generateFakeContentFromTemplate( template ) {
        while ( -1 != template.indexOf('{{hex}}') ) {
            template = template.replace('{{hex}}', faker.datatype.hexadecimal().toUpperCase().replace('0X',''));
        }
        while ( -1 != template.indexOf('{{byte}}') ) {
            template = template.replace('{{byte}}', faker.datatype.hexadecimal(2).toUpperCase().replace('0X',''));
        }

        let alias = {
            n : 'random.numeric',
            a : 'random.alpha',
            A : 'random.alpha({"casing":"upper"})',
        };
        for ( let akey in alias ) {
            template = template.replaceAll(`{{${akey}}}`, `{{${alias[akey]}}}`);
        }
        return faker.fake(template);
    }

    /**
     * output log message to console.
     * @param {*} messages 
     */
    log (... messages ) {
        if ( 'test' === window.envName ) {
            return;
        }
        console.log(...messages);
    }

    /**
     * translate message to target language
     * @param  {...any} messages 
     * @returns 
     */
    $t(... messages) {
        return window.app.$t(messages);
    }
}