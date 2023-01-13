import RequestMatcherScriptRuntime from './RequestMatcherScriptRuntime.js'
export default class RequestMatcher {
    /**
     * @constructor
     * @param {*} rules 
     */
    constructor( rules ) {
        this.rules = rules || [];
    }

    /**
     * match rules by given data
     * @param {*} data 
     * @returns {Array<Object>}
     */
    match( data ) {
        let matchedRules = [];
        for ( let i=0; i<this.rules.length; i++ ) {
            let checkRule = this.rules[i];
            if ( !checkRule.enable ) {
                continue ;
            }

            let matcher = `match${checkRule.matchHandler}`;
            if ( !this[matcher](checkRule, data) ) {
                continue ;
            }

            matchedRules.push(checkRule);
        }
        return matchedRules;
    }

    /**
     * handle match rule for "All"
     * @param {*} data 
     * @returns 
     */
    matchAll( checkRule, data ) {
        return true;
    }

    /**
     * handle match rule for "Text"
     * @param {*} data 
     */
    matchText( checkRule, data ) {
        let content = checkRule.matchContent.content;
        content = content.replaceAll('\r\n', '\n');
        content = content.replaceAll('\r', '\n');
        if ( 'CRLF' == checkRule.matchContent.nlstyle ) {
            content = content.replaceAll('\n', '\r\n');
        } else if ( 'CR' == checkRule.matchContent.nlstyle ) {
            content = content.replaceAll('\n', '\r');
        }
        
        let requestText = data.toString();
        if ( checkRule.matchContent.enableRegex ) {
            let regex = new RegExp(content, 'g');
            return regex.test(requestText);
        } else {
            return requestText == content;
        }
    }

    /**
     * handle match rule for "Hex"
     * @param {*} data 
     */
    matchHex( checkRule, data ) {
        let content = checkRule.matchContent.content;
        content = content.replaceAll(/\s/g,'');
        let requestText = data.toString('hex').toUpperCase();
        if ( checkRule.matchContent.enableRegex ) {
            let regex = new RegExp(content, 'g');
            return regex.test(requestText);
        } else {
            return requestText == content;
        }
    }

    /**
     * handle match rule for "Script"
     * @param {*} data 
     */
    matchScript( checkRule, data ) {
        try {
            let content = checkRule.matchContent.content;
            let runtime = new RequestMatcherScriptRuntime({
                data : data,
            });
            (new Function('$this' , content))(runtime);
            return runtime.getIsMatched();
        } catch ( e ) {
            throw Error(e);
        }
    }

    /**
     * handle match rule for "Json"
     * @param {*} data 
     */
    matchJson( checkRule, data ) {
        try {
            let content = data.toString();
            content = JSON.parse(content);
            let script = `return ${checkRule.matchContent.content}`;
            let isMatched = (new Function('data', script))(content);
            return isMatched;
        } catch ( e ) {
            throw Error(e);
        }
    }
}