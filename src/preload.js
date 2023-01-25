// 串口通讯库
const { SerialPort } = require('serialport')
window.SerialPort = SerialPort;

// 暴露 dialog 属性
const remote = require('@electron/remote');
const { windowsStore } = require('process');
window.remote = remote;
window.dialog = remote.dialog;
window.menu = remote.Menu;
window.shell = require('electron').shell;
window.ipcRenderer = require('electron').ipcRenderer;
window.os = require('os');

window.fs = require('fs');
window.net = require('net');
window.dgram = require('dgram');
window.request = require('request');

// 数据库
let userDataPath = remote.app.getPath('userData');
let databasePath = `${userDataPath}/bittly.db`;
const sqlite3 = require('sqlite3').verbose()
window.sqlite3 = sqlite3;
window.database = new sqlite3.Database(databasePath);

// 经典蓝牙
// @link https://stackoverflow.com/questions/46442623/node-serial-port-as-external-module-in-webpack-module-not-found
const bluetoothSerialPort = remote.require("bluetooth-serial-port");
window.bluetoothSerialPort = bluetoothSerialPort;

// WebSocket
window.ws = require('ws');

// mqtt
window.mqtt = require('mqtt')
// modbus
window.modbus = require("modbus-serial");
// Buffer
window.nodeBuffer = Buffer;

// http
window.https = require('https');
window.http = require('http');

window.path = require('path');
window.envName = 'Electron';