<template>
  <div class="d-inline-block mr-1">
    <a-button v-if="null == userinfo" size="small" type="link"
      ref="btnLoginStart"
      class="p-0 text-body app-dropdown-menu-title text-white" 
      @click="actionShowLoginModal"
      :loading="autoLoginExecuting"
    ><a-icon type="user" /> {{$t('user.loginOrRegister')}} </a-button>

    <a-dropdown v-else :trigger="['click']">
      <span class="app-dropdown-menu-title pr-1" ref="dmenuCurrentUserTrigger">
        <a-icon type="user" /> {{userinfo.name}}
      </span>
      <a-menu ref="menuCurrentUser" slot="overlay" @click="actionUserDropdownMenuItemHandle">
        <a-menu-item key="Logout"> <a-icon type="logout" /> {{$t('user.logout')}} </a-menu-item>
      </a-menu>
    </a-dropdown>
    
    <a-modal ref="modalLogin" v-if="showModal" v-model="showModal" :closable="false" :bodyStyle="{padding:0}">
      <a-tabs ref="tabLoginAndRegister" default-active-key="login" v-model="action" @change="actionLoginActionChange">
        <!-- user login -->
        <a-tab-pane key="login" :tab="$t('user.login')" class="pl-5 pr-5 pt-3 pb-3">
          <a-form :form="loginForm">
            <a-form-item>
              <a-input ref="txtLoginUserName" :placeholder="$t('user.loginByAccountOrEmail')" v-decorator="['account',loginFormAccountValidation]">
                <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>
            
            <a-form-item>
              <a-input-password ref="txtLoginUserPassword" :placeholder="$t('user.password')" v-decorator="['password',loginFormPasswordValidation]">
                <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
              </a-input-password>
            </a-form-item>

            <p class="text-right">
              <a-button ref="btnLoginPasswordReset" type="link" class="p-0" @click="actionShowPasswordResetModal">{{$t('user.forgetPassword')}}</a-button>
            </p>
          </a-form>
        </a-tab-pane>
        
        <!-- user register -->
        <a-tab-pane key="regist" :tab="$t('user.register')" class="pl-5 pr-5 pt-3 pb-5">
          <a-form :form="registForm">
            <a-form-item>
              <a-input ref="txtRegistUserName"
                :placeholder="$t('user.account')" 
                v-decorator="['registAccount',registAccountValidation]"
              >
                <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>

            <a-form-item>
              <a-input-group compact>
                <a-input ref="txtRegistEmail" :placeholder="$t('user.email')" style="width:70%" 
                  v-decorator="['registEmail', registEmailValidation]"
                >
                  <a-icon slot="prefix" type="mail" style="color: rgba(0,0,0,.25)" />
                </a-input>
                <a-button style="width: 30%" ref="btnRegistSendEmailVcode"
                  @click="actionSendEmailValidateCode"
                  :loading="registEmailCodeSending"
                >{{$t('user.sendEmailVerifyCode')}}</a-button>
              </a-input-group>
            </a-form-item>

            <a-form-item>
              <a-input ref="txtRegistEmailVcode"
                :placeholder="$t('user.emailVerifyCode')" 
                v-decorator="['registEmailCode', registEmailCodeValidation]"
              >
                <a-icon slot="prefix" type="safety-certificate" style="color: rgba(0,0,0,.25)" />
              </a-input>
            </a-form-item>

            <a-form-item>
              <a-input-password ref="txtRegistPassword"
                :placeholder="$t('user.password')" 
                v-decorator="['registPassword',registPasswordValidation]"
              >
                <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
              </a-input-password>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
      
      <template slot="footer">
        <div v-if="'login' == action">
          <a-button ref="btnLoginCancel" @click="actionCloseModal">{{$t('button.cancel')}}</a-button>
          <a-button ref="btnLoginExec" type="primary" :loading="loginFormLoginExecuting"
            @click="actionLogin"
          >{{$t('user.login')}}</a-button>
        </div>
        <div v-if="'regist' == action">
          <a-button @click="actionCloseModal">{{$t('button.cancel')}}</a-button>
          <a-button type="primary" ref="btnRegistExec" :loading="registRegising"
            @click="actionRegist"
          >{{$t('user.register')}}</a-button>
        </div>
      </template>

    </a-modal>

    <!-- password reset -->
    <a-modal 
      ref="modalPasswordReset"
      v-if="passwordResetModalEnable" 
      v-model="passwordResetModalEnable" 
      :title="$t('user.passwordReset')"
    >
      <a-form :form="passwordResetForm">
        <a-form-item>
          <a-input-group compact>
            <a-input ref="txtPasswordResetEmail" :placeholder="$t('user.email')" style="width:70%" 
              v-decorator="['email', passwordResetEmailValidation]"
            >
              <a-icon slot="prefix" type="mail" style="color: rgba(0,0,0,.25)" />
            </a-input>
            <a-button style="width: 30%" ref="btnPasswordResetEmailVcodeSend"
              @click="actionSendEmailValidateCodeForPasswordReset"
              :loading="passwordResetEmailCodeSending"
            >{{$t('user.sendEmailVerifyCode')}}</a-button>
          </a-input-group>
        </a-form-item>

        <a-form-item>
          <a-input ref="txtPasswordResetEmailVcode"
            :placeholder="$t('user.emailVerifyCode')" 
            v-decorator="['emailCode', passwordResetEmailCodeValidation]"
          >
            <a-icon slot="prefix" type="safety-certificate" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>

        <a-form-item>
          <a-input-password ref="txtPasswordResetNewPassword"
            :placeholder="$t('user.newPassword')" 
            v-decorator="['password',passwordResetPasswordValidation]"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
          </a-input-password>
        </a-form-item>
      </a-form>
      <template slot="footer">
          <a-button ref="btnPasswordResetCancel" @click="actionPasswordResetModalClose">{{$t('button.cancel')}}</a-button>
          <a-button type="primary"  ref="btnPasswordResetExecute"
            @click="actionPasswordResetExecute"
            :loading="passwordResetExecuting"
          >{{$t('user.passwordReset')}}</a-button>
      </template>
    </a-modal>

  </div>
</template>
<script>
import MdbRuntimeVariable from '../models/MdbRuntimeVariable.js'
export default {
    name : 'AppUserLogin',
    data() {
        return {
            userinfo : null,
            autoLoginExecuting : false,

            action : 'login',
            showModal : false,
            registForm : this.$form.createForm(this, { name: 'regist' }),
            registAccountValidation : null,
            registEmailValidation : null,
            registEmailCodeValidation : null,
            registPasswordValidation : null,
            registEmailCodeSending : false,
            registRegising : false,

            passwordResetModalEnable : false,
            passwordResetForm : this.$form.createForm(this, {name:'password-reset'}),
            passwordResetEmailValidation : null,
            passwordResetEmailCodeSending : false,
            passwordResetEmailCodeValidation: null,
            passwordResetPasswordValidation : null,
            passwordResetExecuting : false,

            loginForm : this.$form.createForm(this, { name: 'login' }),
            loginFormAccountValidation : null,
            loginFormPasswordValidation: null,
            loginFormLoginExecuting : false,
        };
    },
    created() {
        this.setupValidations();
    },
    mounted() {
        this.$eventBus.$on('user-login-required', () => this.actionShowLoginModal());
        this.autoLogin();
    },
    methods : {
        /**
         * auto login, after bittly api client started, we can refresh access token by
         * current access token.
         */
        async autoLogin() {
            if ( this.$bittly.isGuest() ) {
                this.$appLog('auto login failed');
                return ;
            }
            
            this.autoLoginExecuting = true;
            let tokenRefresh = await this.$bittly.userRefreshAccessToken();
            if ( !tokenRefresh.success ) {
                await MdbRuntimeVariable.setVarValue('user_access_token', '');
                await MdbRuntimeVariable.setVarValue('user_access_token_expired_at', '');
                await MdbRuntimeVariable.setVarValue('user_name', '');
                this.autoLoginExecuting = false;
                this.$message.error(`刷新访问密钥失败 : ${tokenRefresh.message}`);
                return;
            }

            await MdbRuntimeVariable.setVarValue('user_access_token', tokenRefresh.data.token);
            await MdbRuntimeVariable.setVarValue('user_access_token_expired_at', tokenRefresh.data.expired_at);
            let name = await MdbRuntimeVariable.getVarValue('user_name', '');
            this.userinfo = {name : name};
            this.autoLoginExecuting = false;
        },

        /**
         * setup validations
         */
        setupValidations() {
            let $this = this;
            this.registAccountValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {pattern:'^[a-z][a-z0-9]+$', message:this.$t('user.accountOnlySupportNumberAndLettersAlsoStartWithLetters'),},
                    {max:16,min:4, message : this.$t('user.accountLengthBetween4And16Chars') },
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                    {validator: ( rule, value, callback ) => $this.validateRegistAccount(rule, value, callback) }
                ]
            };
            this.registEmailValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {type:'email', message : this.$t('messages.formatError'),},
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                    {validator: ( rule, value, callback ) => $this.validateRegistEmail(rule, value, callback) }
                ],
            };
            this.registEmailCodeValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty')},
                    {len:4, message: this.$t('user.emailVerifyCodeIsFourNumbers')},
                    {pattern:'^[0-9]{4}$',message:this.$t('user.emailVerifyCodeIsFourNumbers')},
                ]
            };
            this.registPasswordValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {max:32,min:6, message : this.$t('user.passwordLengthBetween6And32Chars')},
                ],
            };
            this.passwordResetEmailValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {type:'email', message : this.$t('messages.formatError'),},
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                ],
            };
            this.passwordResetEmailCodeValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {len:4, message:this.$t('user.emailVerifyCodeIsFourNumbers')},
                    {pattern:'^[0-9]{4}$',message:this.$t('user.emailVerifyCodeIsFourNumbers')},
                ]
            };
            this.passwordResetPasswordValidation = {
                rules : [
                    {required: true, message :this.$t('messages.cannotBeEmpty'),},
                    {max:32,min:6, message : this.$t('user.passwordLengthBetween6And32Chars')},
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                ],
            };

            this.loginFormAccountValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                ],
            };
            this.loginFormPasswordValidation = {
                rules : [
                    {required: true, message : this.$t('messages.cannotBeEmpty'),},
                    {whitespace:true,message:this.$t('messages.cannotBeEmpty')},
                ],
            };
        },

        /**
         * validate user account
         */
        async validateRegistAccount( rule, value, callback ) {
            let uniqueCheck = await this.$bittly.systemUniqueCheck('user-account', value)
            if ( uniqueCheck.data.exists ) {
                callback(this.$t('user.accountAlreadyExists'));
            } else {
                callback();
            }
        },

        /**
         * validate user email
         */
        async validateRegistEmail( rule, value, callback ) { 
            let uniqueCheck = await this.$bittly.systemUniqueCheck('user-email', value);
            if ( uniqueCheck.data.exists ) {
                callback(this.$t('user.emailAlreadExists'));
            } else {
                callback();
            }
        },

        /**
         * send email vcode
         */
        actionSendEmailValidateCode() {
            let $this = this;
            this.registForm.validateFields(['registEmail'], async (error, values) => {
                if ( null != error ) {
                    return;
                }

                $this.registEmailCodeSending = true;
                let email = $this.registForm.getFieldValue('registEmail');
                let emailCodeSend = await this.$bittly.userEmailValidateCodeSend(email);
                if ( emailCodeSend.success ) {
                    $this.$message.success(this.$t('user.emailSendAndAvailableIn10Mins'));
                } else {
                    $this.$message.error(this.$t('user.emailSendFailed'));
                }
                $this.registEmailCodeSending = false;
            });
        },
        
        /**
         * open login modal
         */
        actionShowLoginModal() {
            this.showModal = true;
        },

        /**
         * switch login action
         */
        actionLoginActionChange( key ) {
            this.action = key;
        },

        /**
         * execute user registion.
         */
        actionRegist() {
            let $this = this;
            this.registForm.validateFields( async ( error, values) => {
                if ( null != error ) {
                    return;
                }

                $this.registRegising = true;
                let params = {
                    account : values.registAccount,
                    email : values.registEmail,
                    emailCode : values.registEmailCode,
                    password : values.registPassword,
                };

                let userRegist = await this.$bittly.userRegist(params);
                if ( userRegist.success ) {
                    $this.$message.success(this.$t('user.registerSuccess'));
                    $this.action = 'login';
                } else {
                    $this.$message.error(userRegist.message);
                }
                $this.registRegising = false;
            });
        },

        /**
         * close login modal
         */
        actionCloseModal() {
            this.showModal = false;
        },

        /**
         * display password reset modal
         */
        actionShowPasswordResetModal() {
            this.passwordResetModalEnable = true;
        },

        /**
         * sent password reset email validate code.
         */
        actionSendEmailValidateCodeForPasswordReset() {
            let $this = this;
            this.passwordResetForm.validateFields(['email'], async (error, values) => {
                if ( null != error ) {
                    return;
                }

                $this.passwordResetEmailCodeSending = true;
                let email = $this.passwordResetForm.getFieldValue('email');
                let emailCodeSend = await this.$bittly.userEmailValidateCodeSend(email);
                if ( emailCodeSend.success ) {
                    $this.$message.success(this.$t('user.emailSendAndAvailableIn10Mins'));
                } else {
                    $this.$message.error(this.$t('user.emailSendFailed'));
                }
                $this.passwordResetEmailCodeSending = false;
            });
        },

        /**
         * reset paasword
         */
        actionPasswordResetExecute() {
            let $this = this;
            this.passwordResetForm.validateFields( async (error, values) => {
                if ( null != error ) {
                    return;
                }

                $this.passwordResetExecuting = true;
                let params = {};
                params.password = $this.passwordResetForm.getFieldValue('password');
                params.email = $this.passwordResetForm.getFieldValue('email');
                params.emailCode = $this.passwordResetForm.getFieldValue('emailCode');
                let resetPassword = await this.$bittly.userPasswordResetByEmailCode(params);
                if ( resetPassword.success ) {
                    $this.$message.success(this.$t('user.passwordResetSuccess'));
                    this.passwordResetModalEnable = false;
                } else {
                    $this.$message.error(this.$t('user.passwordResetFailed'));
                }
                $this.passwordResetExecuting = false;
            });
        },

        /**
         * close password reset modal
         */
        actionPasswordResetModalClose() {
            this.passwordResetModalEnable = false;
        },

        /**
         * user login
         */
        async actionLogin() {
            let $this = this;
            let isFormOk = await (() => {
                return new Promise(( resolve ) => {
                    $this.loginForm.validateFields( async (error, values) => {
                        resolve(null == error)
                    });
                });
            })();
            if ( !isFormOk ) {
                return;
            }

            $this.loginFormLoginExecuting = true;
            let params = {};
            params.password = $this.loginForm.getFieldValue('password');
            params.account = $this.loginForm.getFieldValue('account');
            let login = await this.$bittly.userLogin(params);
            if ( !login.success ) {
                $this.loginFormLoginExecuting = false;
                $this.$message.error(this.$t('user.loginFailed'));
                return;
            }
            
            await MdbRuntimeVariable.setVarValue('user_name', login.data.account);
            await MdbRuntimeVariable.setVarValue('user_access_token', login.data.token);
            await MdbRuntimeVariable.setVarValue('user_access_token_expired_at', login.data.expired_at);
            this.$bittly.accessToken = login.data.token;
            this.$bittly.accessTokenExpiredAt = login.data.expired_at;

            this.userinfo = {name:login.data.account};
            $this.loginFormLoginExecuting = false;
            $this.$message.success(this.$t('user.loginSuccess'));
            $this.showModal = false;
        },

        /**
         * handle current user menu
         */
        actionUserDropdownMenuItemHandle( event ) {
            let handler = `userDropdownMenuItemHandle${event.key}`;
            this[handler]();
        },

        /**
         * user logout
         */
        async userDropdownMenuItemHandleLogout() {
            await this.$bittly.userLogout();
            await MdbRuntimeVariable.setVarValue('user_access_token', '');
            await MdbRuntimeVariable.setVarValue('user_access_token_expired_at', '');
            await MdbRuntimeVariable.setVarValue('user_name', '');
            this.userinfo = null;
            this.$message.success(this.$t('user.logoutSuccess'));
        }
    },
}
</script>