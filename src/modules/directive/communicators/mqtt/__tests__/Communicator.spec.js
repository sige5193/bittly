import Tester from '../../../../../utils/test/UnitTester.js'
import MdbDirective from '@/models/MdbDirective.js';
import Communicator from '../Communicator.js'
import MdbProject from '@/models/MdbProject.js';
import RequestParamBuilder from '../../../parameters/Builder.js';
describe('@/communicators/mqtt/Communicator.js', () => {
    it('debug normal use', async ( done ) => {
        let deviceOnline = null;
        let setup = new Tester({
            mockStoreCommits : {
                communicatorOnline : data => deviceOnline = data,
                communicatorOffline : () => deviceOnline = null,
            },
        });
        await setup.setup();
        
        // test client
        let MqttClient = class {
            constructor () {
                this.eventHandlers = {};
            }
            on( event, handler ) {
                this.eventHandlers[event] = handler;
            }
            once( event, handler ) {
                this.eventHandlers[event] = handler;
            }
            publish( topicName, data, publishOptions, callback ) {
                let $this = this;
                setTimeout(() => {
                    $this.eventHandlers.message(topicName, data, null);
                }, 200);
                callback();
            }
            subscribe( topic, options, callback ) {
                callback(null, {});
            }
            end (x, options, callback) {
                let $this = this;
                setTimeout(() => {
                    $this.eventHandlers.close();
                }, 100);
                callback();
            }
        };


        /** overide mqtt class */
        window.mqtt = {};
        window.mqtt = class {
            static connect() {
                let client = new MqttClient();
                setTimeout(() => {
                    client.eventHandlers.connect();
                }, 200);
                return client;
            }
        };

        let project = new MdbProject();
        project.name = 'test';
        await project.save();

        let testContent = 'TEST-CONTENT';
        let directive = new MdbDirective();
        directive.projectId = project.id;
        directive.target = {
            mqttUri : 'mqtt://127.0.0.1:1883',
            mqttPublishTopic : 'test-topic',
            mqttSubscribeTopic : 'test-topic',
            mqttProtocolVersion : '5',
            mqttPublishContentType : 'mqttPublishContentType',
            mqttPublishMessageExpiryInterval : 'mqttPublishMessageExpiryInterval',
            mqttPublishTopicAlias : 'mqttPublishTopicAlias',
            mqttPublishResponseTopic : 'mqttPublishResponseTopic',
            mqttPublishSubscriptionIdentifier : 'mqttPublishSubscriptionIdentifier',
            mqttPublishCorrelationData : 'mqttPublishCorrelationData',
            mqttPublishPayloadFormatIndicator : 'mqttPublishPayloadFormatIndicator',
            mqttPublishUserProperties : [
                {name:'p001',value:'v001'},
            ],
        };
        directive.requestFormat = 'text';
        directive.requestContent = {};
        directive.requestContent.text = testContent;

        let com = await Communicator.setup(directive.target);
        expect(com.getIsOpen()).toBeFalsy();
        await com.open();
        expect(com.getIsOpen()).toBeTruthy();
        await setup.msleep(500);
        expect(deviceOnline.key).toBe(com.comkey);
        
        com.onData(async ( data ) => {
            data = data.toString();
            expect(data).toBe(testContent);
            expect(com.getDataReceiveSize()).toBe(testContent.length);
            await com.close();
            await setup.msleep(500);
            expect(deviceOnline).toBeNull();
            done();
        });

        let paramBuilder = new RequestParamBuilder(directive);
        await paramBuilder.init();
        await com.write(paramBuilder.getRequestData());
        await setup.msleep(1000);
    })

    it('failed tester', async () => {
        let tester = new Tester();
        await tester.setup();

        // parameter failed handler
        let parameterErrorHandler = jest.fn(() => {});
        try {
            new Communicator({});
        } catch ( e ) {
            parameterErrorHandler(e);
        }
        expect(parameterErrorHandler.mock.calls[0][0].message).toBe('Please input mqtt server address');

        try {
            new Communicator({mqttUri:'mqtt://127.0.0.1:1883'});
        } catch ( e ) {
            parameterErrorHandler(e);
        }
        expect(parameterErrorHandler.mock.calls[1][0].message).toBe('Please input publish topic name');

        let mqttConstructor = jest.fn(($this) => {
            setTimeout(()=>$this.eventHandlers.connect(), 100);
        });
        let mqttSubscribe = jest.fn((topic, options, callback) => callback(null, {}));
        window.mqtt = {};
        window.mqtt.connect = function() {
            return new class {
                constructor() {
                    this.eventHandlers = {};
                    this.eventOnceHandlers = {};
                    mqttConstructor(this);
                }
                on(name, callback) {
                    this.eventHandlers[name] = callback;
                }
                once(name, callback) {
                    this.eventOnceHandlers[name] = callback;
                }
                publish(topicName, data, options, callback) {
                    callback("TEST-PUBLISH-FAILED");
                }
                subscribe( topic, options, callback ) {
                    mqttSubscribe(topic, options, callback);
                }
                end(p1,p2,callback) {
                    callback();
                    this.eventHandlers.close();
                }
            }
        };

        // event handlers
        let com1 = new Communicator({mqttUri:'mqtt://127.0.0.1:1883',mqttPublishTopic:'demo',mqttSubscribeTopic:'demo-sub'});
        mqttSubscribe.mockImplementationOnce((topic, options, callback) => callback("Subscribe FAILED"));
        let mqttSubscribeErrorHandler = jest.fn(() => {});
        try {
            await com1.open();
        } catch ( e ) {
            mqttSubscribeErrorHandler(e);
        }
        expect(mqttSubscribeErrorHandler.mock.calls[0][0]).toBe('Subscribe FAILED');
        await tester.msleep(200);
        
        // event handlers
        let com = new Communicator({mqttUri:'mqtt://127.0.0.1:1883',mqttPublishTopic:'demo'});
        mqttConstructor.mockImplementationOnce(( $this ) => {
            setTimeout(() => $this.eventOnceHandlers.error('TEST-FAILED-ERROR'), 100);
        });
        let openFailedHandler = jest.fn(() => {});
        try {
            await com.open();
        } catch ( e ) {
            openFailedHandler(e);
        }
        expect(openFailedHandler.mock.calls[0][0]).toBe('TEST-FAILED-ERROR');
        await tester.msleep(200);

        // open connection
        await com.open();
        // try to open it again, nothing would happend
        await com.open();
        await tester.msleep(1000);

        // event console log
        let oldConsoleLog = window.console.log;
        window.console.log = jest.fn();
        com.client.eventHandlers.reconnect();
        com.client.eventHandlers.disconnect();
        com.client.eventHandlers.offline();
        com.client.eventHandlers.packetsend();
        com.client.eventHandlers.packetreceive();
        expect(window.console.log).toBeCalledTimes(5);
        window.console.log = oldConsoleLog;

        // trigger error
        let connectionError = jest.fn(() => {});
        try {
            com.client.eventHandlers.error('CON-ERROR');
        } catch ( e ) {
            connectionError(e);
        }
        expect(connectionError.mock.calls[0][0]).toBe('CON-ERROR');
        
        // failed to publish
        let writeFailedHandler = jest.fn(() => {});
        try {
            await com.write("HELLO");
        } catch ( e ) {
            writeFailedHandler(e);
        }
        expect(writeFailedHandler.mock.calls[0][0]).toBe('TEST-PUBLISH-FAILED');

        // close 
        await com.close();
        // close it again, nothing would happend.
        await com.close();
        await tester.msleep(1000);
    });
});