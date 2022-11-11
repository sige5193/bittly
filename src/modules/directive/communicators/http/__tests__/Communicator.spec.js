import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import Tester from '../../../../../utils/test/UnitTester.js'
describe('@/communicators/http/Communicator.js', () => {
    it('normal use', async ( done ) => {
        let tester = new Tester();
        await tester.setup();

        window.https = {
            request(options, callback) {
                return {
                    write() {
                        setTimeout(callback({
                            on(name, handler) {
                                if ( 'data' === name ) {
                                    handler('AABBCCDD');
                                }
                                if ( 'end' === name ) {
                                    setTimeout(()=>handler(), 500);
                                }
                            },
                        }), 500);
                    },
                    on(){},
                    end(){},
                };
            }
        };
        
        let directive = new MdbDirective();
        directive.target = {
            httpMethod : 'GET',
            httpUrl : 'https://www.example.com',
        };

        let options = {};
        let com = await Communicator.setup(options);
        com.setDirective(directive);
        expect(com.getIsOpen()).toBeTruthy();
        
        com.onData(async ( data ) => {
            expect(data.toString()).toBe('AABBCCDD');
            await com.close();
            done();
        });
        let paramBuilder = com.getParamBuilder(directive);
        await com.write(paramBuilder);
        await tester.msleep(1000);
    })

    it('httpFollowRedirectEnable=true && httpFollowRedirectMaxCount=5', async ( ) => {
        let tester = new Tester();
        await tester.setup();

        let redirectCount = 0;
        window.https = {
            request(options, callback) {
                return {
                    write() {},
                    on(){},
                    end(){
                        redirectCount ++;
                        if ( redirectCount >= 10 ) {
                            return;
                        }
                        callback({
                            headers : {
                                location : `${redirectCount}`, 
                            },
                            on(name, handler) {
                                if ( 'data' === name ) {
                                    handler('AABBCCDD');
                                }
                                if ( 'end' === name ) {
                                    setTimeout(()=>handler(), 500);
                                }
                            },
                        });
                    },
                };
            }
        };
        
        let directive = new MdbDirective();
        directive.target = {
            httpMethod : 'GET',
            httpUrl : 'https://www.example.com',
            httpFollowRedirectEnable:true,
            httpFollowRedirectMaxCount :5,
        };

        let options = {};
        let com = await Communicator.setup(options);
        com.setDirective(directive);
        expect(com.getIsOpen()).toBeTruthy();
        let paramBuilder = com.getParamBuilder(directive);
        try {
            await com.write(paramBuilder);
            await tester.msleep(1000);
        } catch ( e ) {
            expect(redirectCount).toBe(5);
            expect(e).toBe('Too many redirects.');
        }
    })
});