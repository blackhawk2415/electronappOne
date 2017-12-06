const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';


let mainWindow;
let addWindow;

// Listen for app to be ready

app.on('ready', function() {
    // create new window
    mainWindow = new BrowserWindow({})
    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when main window closed
    mainWindow.on('closed', function(){
        app.quit();
    });



    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
    // create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    })
    // load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage Collection Handle of auxilary windows to prevent memory
    addWindow.on('close', function(){
        addwindow = null;
    });
};
// catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});



// Create menu template
const mainMenuTemplate = [
    {
        label: 'File', 
        submenu: [
            {
                label: 'Add Item', 
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear'); // dont need to specify parameter since we're clearing
                }
            },
            {
                label: 'Quit',
                // the accelerator adds shortcuts, process platform turnary operator that test platform
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click() {
                    app.quit()
                }
            }
        ]
    }
];

// if mac, add empty object so "file" is 2nd item
if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({}); // array method that adds to beginning, as push adds to end
}


// Add developer tools item if not in prod
if(process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){ //focused window ensure it works on current window
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}

// https://www.youtube.com/watch?v=kN1Czs0m1SU
// christainevengvall electron package tutorial
// npm install --save-dev electron-packager
// npm install --save and --save-dev installs and also includes as dependencies in package.json, --save-dev only saves to development
//to push to build, run [npm run "execute code"] --> npm run package-win