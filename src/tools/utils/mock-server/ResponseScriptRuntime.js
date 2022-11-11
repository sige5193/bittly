export default class ResponseScriptRuntime {
    constructor(requestData, com) {
        this.requestData = requestData;
        this.com = com;
        this.mode = null;
        this.responseData = null;
    }
    requestHexGet(){
        return this.requestData.toString('hex').toUpperCase();
    }
    requestBytesGet(){
        return this.requestData;
    }
    requestTextGet(){
        return Common.charsetConvert(this.requestData, 'utf8', this.com.charset).toString()
    }
    responseHex( data ){
        this.mode = 'hex';
        this.responseData = data;
    }
    responseText(data){
        this.mode = 'text';
        this.responseData = data;
    }
    responseBytes(data) {
        this.mode = 'hex';
        this.responseData = data.toString('hex').toUpperCase();
    }
}