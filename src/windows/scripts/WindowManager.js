﻿// constructor: WindowManager
function WindowManager() {
    //
    this.windowContainer = null;   
    this.windowSetCollection = new WindowSetCollection();

    // Systems
    this.dragging = new WindowMovement(this);
    this.construct = new WindowConstruction();    
    
    // Create unique ID's for the window controller.
    // The id will increase after each get.
    var windowIdCounter = 1;
    this.getNextId = function () {
        return windowIdCounter++;
    } 
}

// Bind to an element and initialize
WindowManager.prototype.bind = function (elementSelector) {
    // Query for the window container element and clear it
    this.windowContainer = document.querySelector(elementSelector);    
    this.windowContainer.innerHTML = '';

    // Create and add the drag overlay element
    var dragOverlay = document.createElement('div');
    dragOverlay.classList.add('window-drag-overlay');
    this.windowContainer.appendChild(dragOverlay);    

    // Initialize the window dragging engine
    this.dragging.init(); 
}

// Get a controller by its unique id
// TODO: search in all controller sets
WindowManager.prototype.getController = function (controllerId) {   
    return this.getActiveControllerSet().get(controllerId);
}

// Get the active controller set
WindowManager.prototype.getActiveControllerSet = function () {
    // Create the first window set if not set exists
    if (this.windowSetCollection.count() === 0) {        
        this.windowSetCollection.add();
        this.windowSetCollection.selectAt(0);
    }

    // Return the selected window set
    return this.windowSetCollection.getSelected();
}

// Create a new window in the current controller collection
WindowManager.prototype.createWindow = function (customOptions) {
    var controller = new WindowController(this.getNextId());

    // Default options
    var options = {
        title: '-',
        size: {
            width: 600,
            height: 400,
        },
        location: {
            x: 100,
            y: 100
        },
        icon: '/images/feather/box.svg',        
        allowMinimize: true,
        allowMaximize: true,
        allowClose: true,
        alwaysOnTop: false,
    };

    // Apply the custom options on the default options        
    for (var key in customOptions) {
        if (customOptions.hasOwnProperty(key)) {
            options[key] = customOptions[key];
        }
    }

    // Create the window element
    var window = this.construct.window();

    // Bind the window to the controller
    controller.bindWindowElement(window);

    // Set the position, size, icon and title of the window
    controller.move(options.location.x, options.location.y);
    controller.resize(options.size.width, options.size.height);
    controller.setIcon(options.icon);
    controller.setTitle(options.title);
console.log(options);
    // Set the allow states
    controller.setAllowMinimize(options.allowMinimize);
    controller.setAllowMaximize(options.allowMaximize);
    controller.setAllowClose(options.allowClose);
    controller.setAlwaysOnTop(options.allowClose);

    // Add the window element to the windows container
    this.windowContainer.appendChild(window);

    var activeCollection = this.getActiveControllerSet();

    // Store the controller
    activeCollection.add(controller);

    // Focus the window        
    controller.focus();

    // Return the window controller
    return controller;
}

// Get the suggested docking zone for a cursor position
WindowManager.prototype.getSuggestedDocking = function (cursorX, cursorY) {
    // Get the dimensions of the window container rectangle
    var container = this.windowContainer.getBoundingClientRect();    

    // Get the relative screen position in the range 0 to 100(%).
    var x = Math.round(((cursorX - container.left) / container.width) * 100);
    var y = Math.round(((cursorY - container.top) / container.height) * 100);

    // Ensure that the x and y are in the 0 to 100 range
    x = Math.min(Math.max(x, 0), 100)
    y = Math.min(Math.max(y, 0), 100)    

    // Try to match a docking suggestion zone
    var dockings = WINDOW_DOCK_ZONES;
    for (var i = 0; i < dockings.length; i++) {
        var d = dockings[i];
        if (x >= d.left && x <= d.right && y >= d.top && y <= d.bottom) {
            return d.name;
        }
    }
    return null;
};

// Render a suggested docking area
WindowManager.prototype.renderSuggestedDocking = function (cursorX, cursorY) {
    // Get the suggested docking for the current cursor position
    var docking = this.getSuggestedDocking(cursorX, cursorY);

    // Get the preview element
    var preview = this.windowContainer.querySelector('.window-drag-overlay .dock-preview');

    if (docking !== null) {

        if (preview === null) {
            // Create the preview element
            preview = document.createElement('div');            
            preview.classList.add('dock-preview');            
            preview.appendChild(document.createElement('div'));

            // Add the preview element to the drag overlay element
            this.windowContainer.querySelector('.window-drag-overlay').appendChild(preview);
        }

        // Show the preview
        preview.style.display = 'block';

        // Set the dimension of the preview
        var dimensions = WINDOW_SNAP_AREAS[docking];
        preview.style.top = dimensions.top;
        preview.style.left = dimensions.left;
        preview.style.width = dimensions.width;
        preview.style.height = dimensions.height;
    }
    else {
        if (preview !== null) {
            // Hide the preview
            preview.style.display = 'none';
        }
    }
}; 