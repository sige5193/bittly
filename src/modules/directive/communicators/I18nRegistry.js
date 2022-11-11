/**
 * i18n files registry
 * @author sige
 */
module.exports = {
    zh : {
        http : require('./http/i18n/zh.lang'),
        websocket : require('./websocket/i18n/zh.lang'),
        serialport : require('./serialport/i18n/zh.lang'),
        network : require('./network/i18n/zh.lang'),
        mqtt : require('./mqtt/i18n/zh.lang'),
        modbus : require('./modbus/i18n/zh.lang'),
        bluetooth : require('./bluetooth/i18n/zh.lang'),
    },
    en : {
        http : require('./http/i18n/en.lang'),
        websocket : require('./websocket/i18n/en.lang'),
        serialport : require('./serialport/i18n/en.lang'),
        network : require('./network/i18n/en.lang'),
        mqtt : require('./mqtt/i18n/en.lang'),
        modbus : require('./modbus/i18n/en.lang'),
        bluetooth : require('./bluetooth/i18n/en.lang'),
    },
};