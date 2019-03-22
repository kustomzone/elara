// constructor: Taskbar
function Taskbar() {
    // Taskbar DIV element    
    this.taskbarElement = null;   

    // Owner window manager
    this.windowManager = null;
}

// Bind to an element and initialize
Taskbar.prototype.bind = function (elementSelector, windowManager) {
    // Query for the taskbar element and clear it
    this.taskbarElement = document.querySelector(elementSelector);    
    this.taskbarElement.innerHTML = '';

    // Store the window manager
    this.windowManager = windowManager;    

    // Create and add the buttons container element
    var windowButtons = document.createElement('div');
    windowButtons.classList.add('sys-window-buttons');
    this.taskbarElement.appendChild(windowButtons);

    // Create a handler for changes that invokes the update function
    var self = this;
    var changeHandler = function() {
        self.update();
    }

    // Subscribe to changes in the selected window set
    this.windowManager.windowSetCollection.events.selectedChanged.subscribe(changeHandler);

    // Subscribe on changes in the window set collection
    this.windowManager.windowSetCollection.events.added.subscribe(function(owner, set) {
        // Subcribe to focus changes of the window set
        set.events.focusChanged.subscribe(changeHandler);    
        set.events.changed.subscribe(changeHandler);
    });
    this.windowManager.windowSetCollection.events.removed.subscribe(function(owner, set) {
        // Unsubcribe from focus changes of the window set
        set.events.focusChanged.unsubscribe(changeHandler);    
        set.events.changed.unsubscribe(changeHandler);
    });
}

// Update the buttons of the taskbar
Taskbar.prototype.update = function() {
    // Get the window buttons container DIV
    var windowButtons = this.taskbarElement.querySelector('.sys-window-buttons');

    // Clear the window buttons container DIV
    windowButtons.innerHTML = '';

    // Get the (ordered) controller of the active controller set
    var orderedControllers = this.windowManager.getActiveControllerSet().getOrdered();

    for (var i = 0; i < orderedControllers.length; i++) {
        let controller = orderedControllers[i];

        // Create the elements
        var button = document.createElement('div');
        var label = document.createElement('span');

        // Set the button class
        button.className = 'sys-window-button';

        // Set the text of the window title label
        label.innerText = controller.getTitle();

        // Get the icon element
        var icon = svgUtil.createSvgElement(controller.getIcon(), 16, 16);

        // Combine the elements of the button
        button.appendChild(icon);
        button.appendChild(label);

        // Add the button to the window buttons element
        windowButtons.appendChild(button);

        // Add a 'window-focus' class for the button of the focussed window
        if (controller.state.focus) {
            button.classList.add('window-focus');
        }

        // Bind the button click event
        button.addEventListener('click', function () {
            controller.focusFromTaskbar();
        });
    }
}