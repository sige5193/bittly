'use strict'
import Application from './main/Application.js'
import { app, protocol, BrowserWindow, session } from 'electron'
app.commandLine.appendSwitch('enable-web-bluetooth', true);
app.commandLine.appendSwitch('enable-experimental-web-platform-features', true);

const isDevelopment = process.env.NODE_ENV !== 'production'
Application.setup().run();

require('@electron/remote/main').initialize();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
