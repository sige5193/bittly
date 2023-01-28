import * as mqtt from "mqtt"
import Common from '@/utils/Common.js';
import MyObject from '../../../../utils/datatype/MyObject.js'
import CommunicatorBase from '../CommunicatorBase.js'
/**
 * communicator for mqtt
 * @author sige
 */
export default class Communicator extends CommunicatorBase {
    /**
     * communicators instances
     */
    static instances = {};

    /**
     * get communicator instance by given options
     * @param {*} options 
     * @returns 
     */
    static async setup( options ) {
        let key = Communicator.generateKeyFromOptions(options);
        if ( undefined == Communicator.instances[key] ) {
            Communicator.instances[key] = new Communicator(options);
        }
        let exector = Communicator.instances[key];
        exector.updateOptions(options);
        return exector;
    }

    /**
     * generate com key by given options
     * @param {Object} options 
     * @returns {string}
     */
    static generateKeyFromOptions(options) {
        return [
            'MQTT',
            options.mqttUri,
            options.mqttClientId,
            options.mqttUsername,
            options.mqttPassword,
            options.mqttProtocolVersion,
            options.mqttSubscribeTopic,
        ].join(':');
    }

    /**
     * constructor of exector
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        this.comkey = Communicator.generateKeyFromOptions(options);
        this.deviceType = 'mqtt';
        this.timeDelayBeforeFirstWrite = 100;

        this.isConnected = false;
        this.client = null;
        
        this.options.mqttUri = this.applyEnvPlaceholderVariables(this.options.mqttUri);
        if ( Common.isEmpty(this.options.mqttUri) ) {
            throw Error(this.$t('uriCannotBeEmpty'));
        }
        if ( Common.isEmpty(this.options.mqttPublishTopic) ) {
            throw Error(this.$t('publishTopicCannotBeEmpty'));
        }

        this.updateOptions(options);
    }

    /**
     * update options without closeit
     * @param {Object} options 
     */
    updateOptions( options ) {
        if ( Common.isEmpty(options.mqttClientId) ) {
            this.options.mqttClientId = `bittly-` + Math.random().toString(16).substring(2, 8);
        }
        
        let attrList = [
            'mqttPublishTopic','mqttPublishQoS','mqttPublishRetain',
            'mqttPublishContentType','mqttPublishMessageExpiryInterval','mqttPublishTopicAlias',
            'mqttPublishResponseTopic','mqttPublishSubscriptionIdentifier','mqttPublishCorrelationData',
            'mqttPublishPayloadFormatIndicator','mqttPublishUserProperties',
        ];
        for ( let i=0; i<attrList.length; i++ ) {
            let name = attrList[i];
            if ( undefined === options[name] ) {
                continue;
            }
            this.options[name] = this.applyEnvPlaceholderVariables(options[name]);
        }
    }

    /**
     * Get if connection is opened
     * @returns {Boolean}
     */
    getIsOpen() {
        return this.isConnected;
    }

    /**
     * open mqtt connection
     * @returns {Promise}
     */
    open() {
        let $this = this;
        return new Promise(function( resolve, reject ) {
            if ( $this.isConnected ) {
                resolve();
                return;
            }

            let mqttConnector = mqtt.connect;
            if ( undefined != window.mqtt ) {
                mqttConnector = window.mqtt.connect;
            }
            
            $this.client = mqttConnector($this.options.mqttUri, {
                clientId : $this.options.mqttClientId,
                username : $this.options.mqttUsername,
                password : $this.options.mqttPassword,
                protocolVersion : parseInt($this.options.mqttProtocolVersion),
                reconnectPeriod : 0, // Disable auto reconnect
            });

            $this.client.on('connect', () => $this.handleOnConnect(resolve, reject) );
            $this.client.once('error', (error) => $this.handleOnOpenError(error, reject) );
            $this.client.on('close', ()=> $this.handleOnClose());
            $this.client.on('message', (topic, message, packet)=>$this.handleOnMessage(topic, message, packet));
            
            $this.client.on('reconnect', ()=>console.log('reconnect'));
            $this.client.on('disconnect', ()=>console.log('disconnect'));
            $this.client.on('offline', ()=>console.log('offline'));
            $this.client.on('packetsend', ()=>console.log('packetsend'));
            $this.client.on('packetreceive', ()=>console.log('packetreceive'));
        });
    }

    /**
     * event handler for connect
     * @param {CallableFunction} resolve 
     * @param {CallableFunction} reject 
     */
    handleOnConnect( resolve, reject ) {
        this.log(`connected`);
        this.client.on('error', (error) => this.handleOnError(error));

        // subscribe a topic as response 
        if ( !Common.isEmpty(this.options.mqttSubscribeTopic) ) {
            this.client.subscribe(this.options.mqttSubscribeTopic, {}, ( err, granted ) => {
                if ( err ) {
                    reject(err);
                    return;
                }
                
                this.log('subscribe',granted);
                this.isConnected = true;
                this.deviceOnline();
                resolve();
            });
        } else {
            this.isConnected = true;
            this.deviceOnline();
            resolve();
        }
    }

    /**
     * event handler for connection error
     * @param {Error} error 
     */
    handleOnError( error ) {
        throw error;
    }

    /**
     * event handler for connection error
     * @param {*} error 
     * @param {*} reject 
     */
    handleOnOpenError( error, reject ) {
        reject(error);
    }

    /**
     * event handler for connection closed
     */
    handleOnClose() {
        this.log('closed');
        if ( !this.isConnected ) {
            return;
        }

        delete Communicator.instances[this.comkey];
        this.deviceOffline();
        this.isConnected = false;
    }

    /**
     * event handler for connection receives data
     * @param {String} topic 
     * @param {Buffer} message 
     * @param {Packet} packet 
     */
    handleOnMessage( topic, message, packet ) {
        this.log('receive', topic, message, packet);
        this.dataReceived(message);
    }
    
    /**
     * publish data to server
     * @param {Buffer} data 
     * @returns {Promise}
     */
    write( data ) {
        this.log('write', data);
        let $this = this;
        return new Promise(( resolve, reject ) => {
            let topicName = $this.options.mqttPublishTopic;
            let publishOptions = $this.generatePublishOptions();
            $this.dataSendSize += data.length;
            $this.client.publish(topicName, data, publishOptions, ( err ) => {
                if ( err ) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     * generate publish options
     * @returns {Object}
     */
    generatePublishOptions () {
        if ( Common.isEmpty(this.options.mqttPublishQoS) ) {
            this.options.mqttPublishQoS = '0';
        }

        if ( Common.isEmpty(this.options.mqttPublishRetain) ) {
            this.options.mqttPublishRetain = false;
        }

        let publishOptions = {};
        publishOptions.qos = parseInt(this.options.mqttPublishRetain);
        publishOptions.retain = this.options.mqttPublishRetain;
        if ( '5' != this.options.mqttProtocolVersion ) {
            return publishOptions;
        }
        
        publishOptions.properties = {};
        if ( !Common.isEmpty(this.options.mqttPublishContentType) ) {
            publishOptions.properties.contentType = this.options.mqttPublishContentType;
        }
        if ( !Common.isEmpty(this.options.mqttPublishMessageExpiryInterval) ) {
            publishOptions.properties.messageExpiryInterval = parseInt(this.options.mqttPublishMessageExpiryInterval);
        }
        if ( !Common.isEmpty(this.options.mqttPublishTopicAlias) ) {
            publishOptions.properties.topicAlias = parseInt(this.options.mqttPublishTopicAlias);
        }
        if ( !Common.isEmpty(this.options.mqttPublishResponseTopic) ) {
            publishOptions.properties.responseTopic = this.options.mqttPublishResponseTopic;
        }
        if ( !Common.isEmpty(this.options.mqttPublishSubscriptionIdentifier) ) {
            publishOptions.properties.subscriptionIdentifier = parseInt(this.options.mqttPublishSubscriptionIdentifier);
        }
        if ( !Common.isEmpty(this.options.mqttPublishCorrelationData) ) {
            publishOptions.properties.correlationData = Buffer.from(this.options.mqttPublishCorrelationData);
        }
        if ( !Common.isEmpty(this.options.mqttPublishPayloadFormatIndicator) ) {
            publishOptions.properties.payloadFormatIndicator = this.options.mqttPublishPayloadFormatIndicator;
        }
        
        if ( !Common.isEmpty(this.options.mqttPublishUserProperties) 
        && this.options.mqttPublishUserProperties.length > 0
        ) {
            let userProperties = {};
            for ( let i=0; i<this.options.mqttPublishUserProperties.length; i++ ) {
                let item = this.options.mqttPublishUserProperties[i];
                userProperties[item.name] = item.value;
            }
            publishOptions.properties.userProperties = userProperties;
        }
        return publishOptions;
    }

    /**
     * close the mqtt connection
     * @returns {Promise}
     */
    close() {
        let $this = this;
        return new Promise(( resolve ) => {
            $this.client.end(true, {}, () => {
                resolve();
            });
        });
    }
}