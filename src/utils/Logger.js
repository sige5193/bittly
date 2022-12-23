export default class Logger {
    /**
     * setup Vue
     */
    static setupVue( vue ) {
        vue.prototype.$log = function (... messages) {
            messages.unshift(this);
            Logger.componentLog(... messages);
        };
    }

    /**
     * @param  {...any} messages 
     */
    static log( ... messages ) {
        let message = messages[0];
        for ( let i=1; i<messages.length; i++ ) {
            let item = messages[i];
            if ( 'object' === typeof(item) ) {
                item = JSON.stringify(item);
            }
            message = message.replace(`{${i-1}}`, item);
        }

        // get caller name
        let callstack = (new Error()).stack.split("\n");
        let callerName = callstack[2].trim().split(' ')[1];
        message = `[renderer] [${callerName}()] => ${message}`;
        window.ipcRenderer.send("app-log", message)
        console.info(message);
    }

    /**
     * log messages in component
     * @param  {...any} messages 
     */
    static componentLog(component, ... messages ) {
        let message = messages[0];
        for ( let i=1; i<messages.length; i++ ) {
            let item = messages[i];
            if ( 'object' === typeof(item) ) {
                item = JSON.stringify(item);
            }
            message = message.replace(`{${i-1}}`, item);
        }

        // get caller name
        let callstack = (new Error()).stack.split("\n");
        let callerName = callstack[3].trim().split(' ')[1].replace('VueComponent.','');
        
        // output message
        let comName = component.$options.name;
        message = `[renderer] [${comName}.${callerName}()] => ${message}`;
        window.ipcRenderer.send("app-log", message)
        console.info(message);
    }
}