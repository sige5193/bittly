import axios from 'axios'
import MdbRuntimeVariable from '../models/MdbRuntimeVariable.js'
import packageInfo from '../../package.json'
import Environment from '../environments/Environment.js';
export default class BittlyApiClient {
    /**
     * 客户端实例
     */
    static client = null;

    /**
     * 配置 Vue
     */
    static setupVue( vue ) {
        BittlyApiClient.client = new BittlyApiClient();
        vue.prototype.$bittly = BittlyApiClient.client;
    }
    
    /**
     * 获取客户端实例
     * @returns {BittlyApiClient}
     */
    static getClient() {
        if ( null == BittlyApiClient.client ) {
            throw "please call setup first !";
        }
        return BittlyApiClient.client;
    }

    /**
     * 启动
     */
    async start() {
        if ( null == BittlyApiClient.client ) {
            throw "please call setup first !";
        }
        BittlyApiClient.client.accessToken = await MdbRuntimeVariable.getVarValue('user_access_token','');
        BittlyApiClient.client.accessTokenExpiredAt = await MdbRuntimeVariable.getVarValue('user_access_token_expired_at','');
    }

    /**
     * 构造函数
     */
    constructor () {
        this.accessToken = '';
        this.accessTokenExpiredAt = '';
    }

    /**
     * 是否登录
     */
    isGuest() {
        if ( '' === this.accessToken || '' == this.accessTokenExpiredAt ) {
            return true;
        }

        let expiredAt = new Date(this.accessTokenExpiredAt);
        let now = new Date();
        if ( expiredAt.getTime() < now.getTime() ) {
            return true;
        }

        return false;
    }

    /**
     * 调用API接口,并将所有响应内容返回
     * @param {*} name 
     * @param {*} params 
     * @returns 
     */
    call( name, params ) {
        if ( 'test' === window.envName ) {
            return {success:true,data:null};
        }

        if ( undefined == params ) {
            params = {};
        }

        let data = new FormData();
        for ( let item in params ) {
            data.append(item, params[item]);
        }
        
        let apiUrl = 'https://bittly.sigechen.com/api';
        if ( 'dev' === Environment.getEnv().mode ) {
            apiUrl = 'http://server.bittly.local/api';
        }

        return new Promise(resolve => {
            axios.post(`${apiUrl}/${name}`, data, {
                headers : {"Bittly-Access-Token" : this.accessToken }
            })
            .then(response => resolve(response.data))
            .catch(e => resolve({success:false,message:`ERROR : ${e.message}`}));
        });
    }

    /**
     * 刷新 Token
     * @returns 
     */
    async userRefreshAccessToken() {
        let response = await this.call('user/refresh-access-token');
        if ( response.success ) {
            this.accessToken = response.data.token;
            this.accessTokenExpiredAt = response.data.expired_at;
        }
        return response;
    }

    /**
     * 检查属性唯一性
     * @param {*} attrName 
     * @param {*} value
     * @returns {Boolean} 
     */
    async systemUniqueCheck( attrName, value ) {
        return await this.call('system/unique-check', {attrName, value});
    }

    /**
     * 发送邮箱验证码
     * @param {*} email 
     */
    async userEmailValidateCodeSend( email ) {
        return await this.call('user/email-validate-code-send', {email});
    }

    /**
     * 用户注册
     */
    async userRegist(params) {
        return await this.call('user/regist', params);
    }

    /**
     * 通过邮箱验证码重置密码
     * @param {Object} params 重置密码参数
     * - password : 新密码
     * - emailCode : 邮箱验证码
     * - email : 邮箱
     */
    async userPasswordResetByEmailCode( params ) {
        return await this.call('user/password-reset-by-email-code', params);
    }

    /**
     * 用户登录，并返回 access_token
     * @param {Object} params 登录参数
     * - account : 账号
     * - password : 密码
     */
    async userLogin( params ) {
        return await this.call('user/login', params);
    }

    /**
     * 登出系统
     */
    async userLogout() {
        return await this.call('user/logout');
    }

    /**
     * 通过账号获取用户信息
     * @param {*} account 
     * @returns 
     */
    async userGetByAccount( account ) {
        return this.call('user/get-by-account', {account:account});
    }

    /**
     * 创建空白项目
     * @returns {object} 
     * - success : 操作是否成功
     * - message : 操作消息
     * - data.uuid : 新项目的UUID
     */
    async projectCreate() {
        return this.call('project/create');
    }

    /**
     * 项目发布
     * @param {Object} params 发布内容
     * - uuid : 项目UUID
     * - comment : 发布说明
     * - content : 项目内容 
     */
    async projectPublish( params ) {
        return this.call('project/publish', params);
    }

    /**
     * 项目版本列表
     * @param {*} uuid 
     * @returns 
     */
    async projectVersionList( uuid ) {
        return this.call('project/version-list', {uuid:uuid});
    }

    /**
     * 根据 UUID 获取项目信息
     * @param {*} uuid 
     */
    async projectGet( uuid ) {
        return this.call('project/get',{uuid:uuid});
    }

    /**
     * 获取项目指定版本内容
     * @param {*} uuid 
     */
    async projectVersionContentGet( uuid, version ) {
        return this.call('project/version-content-get', {uuid:uuid, version:version});
    }

    /**
     * 项目查询
     * @param {*} params 查询参数
     * - text : 关键字
     */
    async projectSearch( params ) {
        return this.call('project/search', params);
    }

    /**
     * 项目删除
     * @param {*} uuid 
     * @returns 
     */
    async projectDelete( uuid ) {
        return this.call('project/delete', {uuid:uuid});
    }

    /**
     * 获取项目成员列表
     * @param {*} uuid 
     */
    async projectMemberList ( uuid ) {
        return await this.call('project/member-list', {uuid:uuid});
    }

    /**
     * 添加用户到项目成员
     * @param {*} uuid 
     * @param {*} uid 
     */
    async projectMemberAdd( uuid, uid ) {
        return await this.call('project/member-add', {uuid, uid});
    }

    /**
     * 项目成员删除
     * @param {*} uuid 
     * @param {*} uid 
     */
    async projectMemberDelete( uuid, uid ) {
        return await this.call('project/member-delete', {uuid, uid});
    }

    /**
     * 反馈发送消息
     * @param {*} message 
     */
    async feedbackSend( message ) {
        return await this.call('feedback/send', message);
    }
    
    /**
     * pull feedback messages from server, as it's not very important to
     * use this tool, so we ignore the error.
     * @param {String} sid 
     * @returns {Promise<Object>}
     */
    async feedbackPull( sid ) {
        return await this.call('feedback/pull', {sid});
    }

    /**
     * share add
     */
    async shareCreate( options ) {
        return await this.call('share/create', options);
    }

    /**
     * @param {*} key 
     * @returns 
     */
    async shareGet(key) {
        return await this.call('share/get',{key:key});
    }

    /**
     * report error info to server
     * @param {*} error 
     * @returns 
     */
    errorReport( error ) {
        let errorInfo = JSON.stringify(error);
        this.call('system/error-report', {error:errorInfo}).catch(e=>console.error(e));
    }

    /**
     * 更新检查
     */
    async systemUpdateCheck( version, clientId ) {
        let appinfo = {};
        appinfo.version = version;
        appinfo.osType = window.os.type();
        appinfo.osArch = window.os.arch();
        appinfo.osPlatform = window.os.platform();
        appinfo.osVersion = window.os.version();
        appinfo.clientId = clientId;
        return await this.call('system/update-check', appinfo);
    }
}