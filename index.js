const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV?.trim() === 'development'


app.whenReady().then(() => {

    // Create a window
    const win = new BrowserWindow({
        width: 1920 * 0.6,
        height: 1620 * 0.6,
        resizable: false,
        icon: path.resolve(__dirname, './web/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: isDev ? false : true, // Dev 环境关闭跨域限制
        }
    })

    win.setMenu(null)

    // DEV: 默认打开开发者工具
    if (isDev) win.webContents.openDevTools()

    // Load main page
    win.loadURL(path.resolve(__dirname, './web/index.html'))
})