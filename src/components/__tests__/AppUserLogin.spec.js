import UnitTester from '../../utils/test/UnitTester.js';
import AppUserLogin from '../AppUserLogin.vue'
import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
describe('@/components/AppUserLogin.vue', () => {
    it('user login', async () => {
        window.console.warn = () => {};
        let userLoginHandler = jest.fn();

        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => true,
                userLogin : userLoginHandler,
            }
        });
        await tester.setup();
        await tester.mount(AppUserLogin);
        await tester.msleep(200);

        await tester.click({ref:'btnLoginStart'});
        await tester.msleep(500);
        
        // form valid failed, cause password empty
        await tester.input({ref:'txtLoginUserName'},'SIGE');
        await tester.input({ref:'txtLoginUserPassword'},'');
        await tester.click({ref:'btnLoginExec'});
        await tester.msleep(500);
        expect(userLoginHandler).not.toBeCalled();

        // password error
        userLoginHandler.mockReturnValue({success:false,data:null});
        await tester.input({ref:'txtLoginUserName'},'SIGE');
        await tester.input({ref:'txtLoginUserPassword'},'WRONG-PASSWORD');
        await tester.click({ref:'btnLoginExec'});
        await tester.msleep(500);
        expect(userLoginHandler).toBeCalled();

        // login succes
        userLoginHandler.mockReturnValue({success:true,data:{account:'sige',token:'TOKEN',expired_at:'2022'}});
        await tester.input({ref:'txtLoginUserName'},'SIGE');
        await tester.input({ref:'txtLoginUserPassword'},'PASSWORD');
        await tester.click({ref:'btnLoginExec'});
        await tester.msleep(500);
        expect(userLoginHandler).toBeCalled();
        expect(tester.text({ref:'dmenuCurrentUserTrigger'})).toBe('sige');
    }, 20000);

    it('user register', async () => {
        let bittlySystemUniqueCheck = jest.fn();
        let bittlyUserEmailValidateCodeSend = jest.fn();
        let bittlyUserRegist = jest.fn();
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => true,
                systemUniqueCheck : bittlySystemUniqueCheck,
                userEmailValidateCodeSend : bittlyUserEmailValidateCodeSend,
                userRegist : bittlyUserRegist, // () => { return {success:true}; }
            }
        });
        await tester.setup();
        await tester.mount(AppUserLogin);
        await tester.msleep(200);

        await tester.click({ref:'btnLoginStart'});
        await tester.msleep(500);
        // switch to regists tab
        await tester.emit({ref:'tabLoginAndRegister'},'change',['regist']);
        await tester.msleep(200);
        expect(tester.dataGet('action')).toBe('regist');
        
        // user name already exists
        bittlySystemUniqueCheck.mockReturnValue({success:true,data:{exists:true}});
        await tester.input({ref:'txtRegistUserName'},'sige');
        // user name is ok
        bittlySystemUniqueCheck.mockReturnValue({success:true,data:{exists:false}});
        await tester.input({ref:'txtRegistUserName'},'regsige');

        // email already exists
        bittlySystemUniqueCheck.mockReturnValue({success:true,data:{exists:true}});
        await tester.input({ref:'txtRegistEmail'},'abc@email.com');
        // user name is ok
        bittlySystemUniqueCheck.mockReturnValue({success:true,data:{exists:false}});
        await tester.input({ref:'txtRegistEmail'},'test@email.com');

        // email address invild
        await tester.input({ref:'txtRegistEmail'},'bad-email-address');
        await tester.click({ref:'btnRegistSendEmailVcode'});
        expect(bittlyUserEmailValidateCodeSend).not.toBeCalled();
        await tester.click({ref:'btnRegistExec'});

        // email address ok, but faild to send
        await tester.input({ref:'txtRegistEmail'},'test@email.com');
        bittlyUserEmailValidateCodeSend.mockReturnValue({success:false});
        await tester.click({ref:'btnRegistSendEmailVcode'});

        // email vcode sent
        await tester.input({ref:'txtRegistEmail'},'test@email.com');
        bittlyUserEmailValidateCodeSend.mockReturnValue({success:true});
        await tester.click({ref:'btnRegistSendEmailVcode'});

        await tester.input({ref:'txtRegistEmailVcode'}, '1234');
        await tester.input({ref:'txtRegistPassword'}, 'PASSWORD');
        
        // failed to regist
        bittlyUserRegist.mockReturnValue({success:false,message:'TEST-FAILED-MESSAGE'});
        await tester.click({ref:'btnRegistExec'});
        expect(tester.dataGet('action')).toBe('regist');
        
        // success
        bittlyUserRegist.mockReturnValue({success:true});
        await tester.click({ref:'btnRegistExec'});
        await tester.msleep(500);
        expect(tester.dataGet('action')).toBe('login');
    } ,10000);

    it('password reset', async () => {
        let bittlyUserEmailValidateCodeSend = jest.fn();
        let bittlyUserPasswordResetByEmailCode = jest.fn()
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => true,
                userEmailValidateCodeSend:bittlyUserEmailValidateCodeSend,
                userPasswordResetByEmailCode : bittlyUserPasswordResetByEmailCode,
            }
        });
        await tester.setup();
        await tester.mount(AppUserLogin);
        await tester.msleep(200);
        await tester.eventBusEmit('user-login-required');
        await tester.msleep(500);

        // click password reset button
        await tester.click({ref:'btnLoginPasswordReset'});
        await tester.msleep(200);
        expect(tester.exists({ref:'modalPasswordReset'})).toBeTruthy();

        // input email address, invild email address
        await tester.input({ref:'txtPasswordResetEmail'},'bad-email-address');
        await tester.click({ref:'btnPasswordResetEmailVcodeSend'});
        await tester.msleep(200);

        // input email address, send email failed
        bittlyUserEmailValidateCodeSend.mockReturnValue({success:false});
        await tester.input({ref:'txtPasswordResetEmail'},'test@email.com');
        await tester.click({ref:'btnPasswordResetEmailVcodeSend'});
        await tester.click({ref:'btnPasswordResetExecute'});
        await tester.msleep(200);

        // input email address, send email success
        bittlyUserEmailValidateCodeSend.mockReturnValue({success:true});
        await tester.input({ref:'txtPasswordResetEmail'},'test@email.com');
        await tester.click({ref:'btnPasswordResetEmailVcodeSend'});
        await tester.msleep(200);

        await tester.input({ref:'txtPasswordResetEmailVcode'}, '1234');
        await tester.input({ref:'txtPasswordResetNewPassword'}, 'newpassword');
        
        // failed to reset
        bittlyUserPasswordResetByEmailCode.mockReturnValue({success:false});
        await tester.click({ref:'btnPasswordResetExecute'});
        await tester.msleep(200);

        // success to reset
        bittlyUserPasswordResetByEmailCode.mockReturnValue({success:true});
        await tester.click({ref:'btnPasswordResetExecute'});
        await tester.msleep(200);
        expect(tester.dataGet('passwordResetExecuting')).toBeFalsy();
    }, 30 * 1000);

    it('auto login - bad access token', async() => {
        let bittlyUserRefreshAccessToken = jest.fn();
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => false,
                userRefreshAccessToken:bittlyUserRefreshAccessToken,
            }
        });
        await tester.setup();

        bittlyUserRefreshAccessToken.mockReturnValue({success:false,message:'TEST-FAILED'});
        await tester.mount(AppUserLogin);
        await tester.msleep(200);
    })

    it('auto login - success', async() => {
        let bittlyUserRefreshAccessToken = jest.fn();
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => false,
                userRefreshAccessToken:bittlyUserRefreshAccessToken,
            }
        });
        await tester.setup();

        bittlyUserRefreshAccessToken.mockReturnValue({success:true,data:{token:'TOKEN',expired_at:'2022'}});
        await tester.mount(AppUserLogin);
        await tester.msleep(200);
        let token = await MdbRuntimeVariable.getVarValue('user_access_token');
        expect(token).toBe('TOKEN');
    })

    it('logout', async () => {
        let userLogoutApi = jest.fn(() => {return {success:true};});
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => false,
                userRefreshAccessToken:() => { return {success:true,data:{token:'TOKEN',expired_at:'2022'}}; },
                userLogout:userLogoutApi,
            }
        });
        await tester.setup();
        await tester.mount(AppUserLogin);
        await tester.msleep(200);
        let userAccessToken = await MdbRuntimeVariable.getVarValue('user_access_token');
        expect(userAccessToken).toBe('TOKEN');
        
        await tester.dropdownMenuClick({ref:'dmenuCurrentUserTrigger'},{ref:'menuCurrentUser'},'Logout');
        userAccessToken = await MdbRuntimeVariable.getVarValue('user_access_token','');
        expect(userAccessToken).toBe('');
        expect(userLogoutApi).toBeCalled();
    })

    it('close modal', async () => {
        let tester = new UnitTester({
            mockBittlyApiClient : {
                isGuest : () => false,
                userRefreshAccessToken:() => { return {success:false,message:'TEST-FAILED'}; },
            }
        });
        await tester.setup();
        await tester.mount(AppUserLogin);
        await tester.msleep(200);
        
        // open login modal
        await tester.eventBusEmit('user-login-required');
        await tester.msleep(500);

        // open password reset modal
        await tester.click({ref:'btnLoginPasswordReset'});
        await tester.msleep(200);
        expect(tester.exists({ref:'modalPasswordReset'})).toBeTruthy();
        // close password reset modal
        await tester.click({ref:'btnPasswordResetCancel'});
        await tester.msleep(200);
        expect(tester.exists({ref:'modalPasswordReset'})).toBeFalsy();

        // close login modal
        await tester.click({ref:'btnLoginCancel'});
        await tester.msleep(200);
        expect(tester.exists({ref:'modalLogin'})).toBeFalsy();
    })
});