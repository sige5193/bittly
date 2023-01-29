import encoding from 'encoding';
class Common {
    /**
     * @param {Buffer} buf 
     * @returns {DataView}
     */
    static convertBufferToDataView(buf) {
        if ( null == buf ) {
            buf = [];
        }
        let arrayBuf = new ArrayBuffer(buf.length);
        var uint8Array = new Uint8Array(arrayBuf);

        for ( let i=0; i<buf.length; i++ ) {
            uint8Array[i] = buf[i];
        }
        return new DataView(uint8Array.buffer);
    }
    
    /**
     * check if variable is empty
     * @param {*} variable 
     * @returns 
     */
    static isEmpty( variable ) {
        return undefined === variable
        || null === variable
        || ('string' === typeof(variable) && 0 === variable.length)
        || (Array.isArray(variable) && 0 === variable.length);
    }

    /** */
    static msleep ( time ) {
        return new Promise(( resolve ) => {
            setTimeout(resolve, time);
        });
    }
    
    /**
     * 对象复制
     * @param {*}} obj 
     * @returns 
     */
    static objCopy( obj ) {
        if ( undefined === obj ) {
            return undefined;
        }
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * get content of file
     * @param {String} filepath 
     * @returns 
     */
    static fileGetContent( filepath ) {
        if ( Common.isEmpty(filepath) ) {
            throw Error(window.app.$t('directive.parameter.file.filepathCannotBeEmpty'));
        }
        
        try {
            window.fs.accessSync(filepath, window.fs.constants.R_OK);
        } catch ( e ) {
            console.log(e);
            throw Error(window.app.$t('directive.parameter.file.filepathUnableToRead',[filepath]));
        }

        let content = null;
        try {
            content = window.fs.readFileSync(filepath);
        } catch ( e ) {
            throw Error(window.app.$t('directive.parameter.file.readFailed',[filepath, e.message]));
        }
        return content;
    }

    /**
     * 当前是否为APPX包运行模式
     * @returns {Boolean}
     */
    static isAppx() {
        let exePath = window.remote.app.getPath("exe");
        return -1 != exePath.indexOf('27525510E657F.bittly.app');
    }

    /**
     * 比较两个对象是否相同
     * @param {*} objA 
     * @param {*} objB 
     */
    static objectIsSame(objA, objB) {
        let keys = Object.keys(objA);
        if ( keys.length != Object.keys(objB).length ) {
            return false;
        }
        for ( let i=0; i<keys.length; i++ ) {
            let valA = objA[keys[i]];
            let valB = objB[keys[i]];

            let isSame = true;
            if ( (valA != null && typeof valA === 'object') && (valB != null && typeof valB === 'object') ) {
                isSame = Common.objectIsSame(valA, valB);
            } else {
                isSame = valA === valB;
            }
            if ( !isSame ) {
                return false;
            }
        }
        return true;
    }

    /**
     * 字符编码转换
     * @param {*} content 
     * @param {*} to 
     * @param {*} from 
     * @returns 
     */
    static charsetConvert( content, to, from ) {
        if ( to == from ) {
            return content;
        }
        return encoding.convert(content, to, from);
    }

    /**
     * 将十六进制字符串转换为字节数组
     * @note 如果转换内容的字符数量不是偶数个，则最后一个字节将会加前缀0， 例如0xACB 将会变成 0xAC0B
     * @param {*} content 
     * @returns 
     */
    static convertStringToHex(content) {
        let contentRaw = content;
        if ( undefined === content ) {
            return new Uint8Array(0);
        }

        content = content.trim().replace(/\s*/g,'');
        if ( 0 === content.length ) {
            return new Uint8Array(0);
        }

        content = content.toUpperCase();
        if ( !/^[0-9A-F]+?$/.test(content) ) {
            throw Error(window.app.$t('messages.stringToHexIllegalChars', [contentRaw]));
        }
        
        content = content.split('');
        if (content.length % 2 !== 0) {
            content.push(content[content.length-1]);
            content[content.length-2] = '0';
        }

        let numBytes = content.length / 2;
        let bytes = new Uint8Array(numBytes);
        for (let i=0; i<numBytes; i++) {
            bytes[i] = parseInt(`${content[i*2]}${content[i*2+1]}`, 16);
        }
        return bytes;
    }
    
    /**
     * @param {*} buffer 
     * @returns 
     */
    static convertBufferToHexString( buffer ) {
        let hex = [];
        for ( let i=0; i<buffer.length; i++ ) {
            let byte = buffer[i].toString(16).toUpperCase().padStart(2,'0');
            hex.push(byte);
        }
        return hex.join(' ');
    }

    /**
     * 执行指令请求脚本
     * @param {*} thisObj 
     * @param {*} script
     * @deprecated
     */
    static executeDirectiveRequestScript( directive ) {
        let result = directive.requestContent[directive.requestFormat];
        if ( 0 === directive.requestScript.trim().length ) {
            return result;
        }

        if ( 'javascript' === directive.requestScriptLang ) {
            directive = JSON.parse(JSON.stringify(directive));
            directive.data = result;
            let func = Function(directive.requestScript);
            result = func.call(directive);
        } else if ( 'lua' === directive.requestScriptLang ) {
            // /**
            //  * 执行 Lua 脚本时，指令对象会被放到 widnow.directive 上，
            //  * 在 lua 脚本中可通过 js.global.directive 进行访问
            //  * 并在需要的时候通过直接访问的方式 `js.global.directive.requestContent.form[0].value = 1` 修改指令中的值，
            //  * 脚本不需要返回任何数据， 所有的修改都是通过直接修改的方式进行。
            //  * 当执行完毕后，widnow.directive 将会被移除
            //  */
            // window.directive = JSON.parse(JSON.stringify(directive));
            // let lua = new LuaVM.Lua.State();
            // let res = lua.execute(directive.requestScript);
            // console.log(res);
            // if ( -1 != ['string','hex'].indexOf(directive.requestFormat) ) {
            //     result = res[0];
            // } else if ( 'form' === directive.requestFormat ) {
            //     result = JSON.parse(JSON.stringify(window.directive.requestContent.form));
            // }
            // delete window.directive;
        }
        return result;
    }

    /**
     * 执行指令响应脚本
     * @param {*} thisObj 
     * @param {*} script 
     * @deprecated
     */
     static executeDirectiveResponseScript( directive, response ) {
        debugger;
        let result = response;
        if ( 0 === directive.responseScript.trim().length ) {
            return result;
        }

        if ( 'javascript' === directive.responseScriptLang ) {
            directive = JSON.parse(JSON.stringify(directive));
            directive.data = response;
            let func = Function(directive.responseScript);
            result = func.call(directive);
        } else if ( 'lua' === directive.responseScriptLang ) {
            // /**
            //  * 执行 Lua 脚本时，指令对象会被放到 widnow.directive 上，
            //  * 在 lua 脚本中可通过 js.global.directive 进行访问
            //  * 响应内容为 js.global.response, 脚本结束后， js.global.resposne 的值将会被更新为响应内容
            //  * 当执行完毕后，widnow.directive 和 window.response 将会被移除
            //  */
            // window.directive = JSON.parse(JSON.stringify(directive));
            // window.response = response;
            // let lua = new LuaVM.Lua.State();
            // lua.execute(directive.requestScript);
            // result = window.response;
            // delete window.directive;
            // delete window.response;
        }
        return result;
    }

    /**
     * show confirm dialog with given title
     * @param {*} title 
     * @returns 
     */
    static confirm( title ) {
        return new Promise(resolve => {
            window.app.$confirm({
                title: title,
                okText : window.app.$t('button.ok'),
                cancelText : window.app.$t('button.cancel'),
                onOk : () => resolve(true),
                onCancel : () => resolve(false),
            });
        });
    }
}
export default Common;