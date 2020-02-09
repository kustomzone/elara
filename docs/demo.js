// Available window layouts
var ELARA_WINDOW_LAYOUTS = [
    {
        title: 'Cascade Windows',
        name: 'cascade',
        icon: 'img/feather/layers.svg'
    },
    {
        title: 'Split Windows',
        name: 'split',
        icon: 'img/feather/grid.svg'
    },
    {
        title: 'Maximize All Windows',
        name: 'maximizeAll',
        icon: 'img/feather/maximize.svg'
    },
    {
        title: 'Minimize All Windows',
        name: 'minimizeAll',
        icon: 'img/feather/minimize.svg'
    },
    {
        title: 'Show All Windows',
        name: 'showAll',
        icon: 'img/feather/menu.svg'
    }
];

function initLauncherZone(toolbar, windows) {    
    var launcherZone = toolbar.addZone('launcher');

    launcherZone.setDataSource(function () {
        var items = [];

        items.push({
            'title': 'Open welcome window',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'welcome/index.html', 'Welcome');
            }
        });

        items.push({
            'title': 'Layers.js page',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'https://hlhielkema.github.io/layers.js/', 'Layers.js');
            }
        });        

        items.push({
            'title': 'Domotica dashboard (concept)',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'https://hlhielkema.github.io/domotica_dashboard_concept/', 'Dashboard (concept)');
            }
        });        

        items.push({
            'title': 'Open PowerShell (fake)',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'powershell_cli/index.html', 'PowerShell');
            }
        });        

        items.push({
            'title': 'Picture viewer',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'picture_viewer/index.html', 'Pictures');
            }
        });    

        items.push({
            'title': 'Open external site (Wikipedia)',
            'icon': 'img/feather/hard-drive.svg',
            'click': function () {
                startFrame(windows, 'https://wikipedia.com', 'Wikipedia.com');
            }
        });        
  
        return [
            {
                title: 'Applications',
                items: items
            }
        ];
    });
}

function initSystemZone(toolbar, windows)
{
    var systemZone = toolbar.addZone('system');    
    
    systemZone.setDataSource(function () {
        function createLayoutFn(name) {
            return function () {
                windows.getActiveControllerSet()[name]();
            };
        }
        var items = [];
        for (var i = 0; i < ELARA_WINDOW_LAYOUTS.length; i++) {
            let fn = createLayoutFn(ELARA_WINDOW_LAYOUTS[i].name);
            items.push({
                'title': ELARA_WINDOW_LAYOUTS[i].title,
                'icon': ELARA_WINDOW_LAYOUTS[i].icon,
                'click': function () {
                    fn();
                    return true; // cancel close
                }
            });
        }

        for (var j = 0; j < windows.windowSetCollection.count(); j++) {
            let index = j;
            items.push({
                'title': 'Workspace ' + (j + 1),
                'icon': 'img/feather/monitor.svg',
                'click': function () {
                    windows.windowSetCollection.selectAt(index);
                    return true;
                }
            });
        }
        items.push({
            'title': 'Add workspace',
            'icon': 'img/feather/plus-square.svg',
            'click': function () {
                windows.windowSetCollection.add();
                windows.windowSetCollection.selectAt(windows.windowSetCollection.count() - 1);
                return true;
            }
        });

        return [
            {
                title: 'Windows',
                items: items
            }
        ];
    });
}

function startFrame(windows, source, title) {
    var controller = windows.createIFrameWindow(source,
        {
            title: title,
            size: {
                width: 1400,
                height: 800
            },
            icon: 'img/feather/circle.svg'
        }
    );

    controller.iframe.onload = function() {
        if (controller.iframe.contentDocument !== null) {
            // Set the title
            controller.setTitle(controller.iframe.contentDocument.title);

            // Try to read the desired icon from the meta element
            var iconMetaElement = controller.iframe.contentDocument.head.querySelector('meta[name=elara-icon]');
            if (iconMetaElement !== null) {
                var icon = iconMetaElement.content;        
                controller.setIcon(icon);
            }
        }
    }    

    controller.focus();
}

function startElaraDemo()
{
    // Create the window, taskbar and toolbar managers
    var windows = new Elara.WindowManager();
    var taskbar = new Elara.Taskbar();
    var toolbar = new Elara.Toolbar();

    // Bind the managers to the HTML elements
    windows.bind('.elara-window-container');
    taskbar.bind('.elara-taskbar', windows);
    toolbar.bind('.elara-toolbar', windows);

    // Add the second and third workspace
    windows.windowSetCollection.add();
    windows.windowSetCollection.add();
    
    // Initialize the menu's of the toolbar
    initLauncherZone(toolbar, windows);
    initSystemZone(toolbar, windows);

    // Render the toolbar
    // TODO: render menu when the zones changed. also support SuspendLayout/ResumeLayout.
    toolbar.renderMenu();

    // Show the welcome page in a window
    startFrame(windows, 'welcome/index.html', 'Welcome');
}

startElaraDemo();