import MouseDragDropTracker from '../../shared/scripts/MouseDragDropTracker';

// constructor: WindowMovement
function WindowMovement(windowManager) {
    this.windowManager = windowManager;
    this.engine = new MouseDragDropTracker();
    this.resizeZoneSize = 16;
}

WindowMovement.prototype.onTitlebarGrab = function onTitlebarGrab(e) {
    const self = this;
    self.engine.start(e, {
        init(session) {
            // Query and store the inner window element
            session.setInnerTarget(session.target.closest('.elara-window'));

            // Find the controller for the element
            const controllerId = session.innerTarget.getAttribute('data-controller-id');
            const controller = self.windowManager.getController(controllerId);
            session.setController(controller);

            // Determine the initial position of the window inside its container
            const containerRect = self.windowManager.windowContainer.getBoundingClientRect();
            const windowRect = session.innerTarget.getBoundingClientRect();

            // Store the initial position and size of the window
            const initialX = windowRect.left - containerRect.left;
            const initialY = windowRect.top - containerRect.top;
            session.setInitialPosition(initialX, initialY);
        },
        transform(session, dx, dy, x, y, first, completed) {
            if (first) {
                // Add a class to the window container to indicate that dragging is active
                self.windowManager.windowContainer.classList.add('window-dragging-active');

                // Update the moving state
                session.controller.setMoving(true);

                // Focus the window
                session.controller.focus();

                // Get the window on top of the overlays
                session.innerTarget.style.setProperty('z-index', 2000);
            }

            const newX = session.initialX + dx;
            const newY = session.initialY + dy;

            // Move the window to the new position
            session.controller.move(newX, newY);

            if (completed) {
                const docking = self.windowManager.getSuggestedDocking(x, y);
                if (docking != null) {
                    session.controller.resize(docking);
                }
                else {
                    // Move the window to the new position
                    session.controller.move(newX, newY);
                }

                // Remove the class from the window container that indicates that dragging is active
                self.windowManager.windowContainer.classList.remove('window-dragging-active');

                // Update the moving state
                session.controller.setMoving(false);
            }
            else {
                // Restore its non-relative size when moving the window
                if (session.controller.state.relative) {
                    session.controller.setRelative(false);
                }

                // Render the docking suggestion
                self.windowManager.renderSuggestedDocking(x, y);
            }
        },
    });
};

WindowMovement.prototype.determineResizeCursor = function determineResizeCursor(hmode, vmode) {
    if ((hmode === 'resize' && vmode === 'resize')
        || (hmode === 'move' && vmode === 'move')) {
        return 'nw-resize';
    }
    if ((hmode === 'resize' && vmode === 'move')
            || (hmode === 'move' && vmode === 'resize')) {
        return 'ne-resize';
    }
    if (hmode !== 'none' && vmode === 'none') {
        return 'e-resize';
    }
    if (hmode === 'none' && vmode !== 'none') {
        return 'n-resize';
    }
    throw new Error('invalid input');
};

// Determine which transform mode to use for a cursor position.
// x: cursor x-position relative to the window element.
// y: cursor y-position relative to the window element.
// width: window element width in pixels.
// height: window element height in pixels.
WindowMovement.prototype.determineModes = function determineModes(x, y, width, height) {
    const zone = this.resizeZoneSize; // default = 16
    let hmode = 'none';
    let vmode = 'none';
    if (x < 16) {
        hmode = 'move';
    }
    else if (width - x < zone) {
        hmode = 'resize';
    }
    if (y < zone) {
        vmode = 'move';
    }
    else if (height - y < zone) {
        vmode = 'resize';
    }
    return {
        hmode,
        vmode,
    };
};

WindowMovement.prototype.onWindowGrab = function onWindowGrab(e) {
    const self = this;
    self.engine.start(e, {
        init(session) {
            // Query and store the inner window element
            session.setInnerTarget(session.target.closest('.elara-window'));

            // Find the controller for the element
            const controllerId = session.innerTarget.getAttribute('data-controller-id');
            const controller = self.windowManager.getController(controllerId);
            session.setController(controller);

            // Determine the initial position of the window inside its container
            const containerRect = self.windowManager.windowContainer.getBoundingClientRect();
            const windowRect = session.innerTarget.getBoundingClientRect();

            // Store the initial position and size of the window
            const initialX = windowRect.left - containerRect.left;
            const initialY = windowRect.top - containerRect.top;
            const initialWidth = session.controller.size.x.getPx(); // inner window width
            const initialHeight = session.controller.size.y.getPx(); // inner window height
            session.setInitialPosition(initialX, initialY);
            session.setInitialSize(initialWidth, initialHeight);

            // Get the relative cursor position and window size
            const relativeX = e.pageX - windowRect.left;
            const relativeY = e.pageY - windowRect.top;
            const windowWidth = windowRect.width;
            const windowHeight = windowRect.height;

            // Determine the transform mode for the current cursor position
            const modes = self.determineModes(relativeX, relativeY, windowWidth, windowHeight);
            session.setTransformMode(modes.hmode, modes.vmode);

            // Determine which cursor to use and set it
            const cursor = self.determineResizeCursor(session.hmode, session.vmode);
            session.innerTarget.style.setProperty('cursor', cursor);
        },
        transform(session, dx, dy, x, y, first, completed) {
            if (first) {
                // Add a class to the window container to indicate that resize is active
                self.windowManager.windowContainer.classList.add('window-resize-active');

                // Update the resizing state
                session.controller.setResizing(true);

                // Focus the window
                session.controller.focus();

                // Get the window on top of the overlays
                session.innerTarget.style.setProperty('z-index', 2000);
            }

            let rx = session.initialX;
            let ry = session.initialY;
            let rw = session.initialWidth;
            let rh = session.initialHeight;

            if (session.hmode === 'resize') {
                rw += dx;
            }
            else if (session.hmode === 'move') {
                rx += dx;
                rw -= dx;
            }

            if (session.vmode === 'resize') {
                rh += dy;
            }
            else if (session.vmode === 'move') {
                ry += dy;
                rh -= dy;
            }

            if (rw < 0) rw = 0;
            if (rh < 0) rh = 0;

            session.controller.move(rx, ry);
            session.controller.resize(rw, rh);

            if (completed) {
                // Update the resizing state
                session.controller.setResizing(false);

                // Remove the class from the window container that indicates that resize is active
                self.windowManager.windowContainer.classList.remove('window-resize-active');
            }
        },

    });
};

WindowMovement.prototype.init = function init() {
    const self = this;
    // Bind a mouse-down event on title bars of windows
    document.addEventListener('mousedown', (e) => {
        // Move
        if (e.target.classList.contains('elara-title-bar')
            || e.target.classList.contains('elara-title')) {
            self.onTitlebarGrab(e);
        }
        else if (e.target.classList.contains('elara-window')) {
            self.onWindowGrab(e);
        }
        else {
            // Try to find a window element in the click event path
            for (let i = 0; i < e.path.length; i++) {
                if (e.path[i].classList !== undefined
                    && e.path[i].classList.contains('elara-window')) {
                    // Get the controller of the window
                    const controllerId = e.path[i].getAttribute('data-controller-id');
                    const controller = self.windowManager.getController(controllerId);
                    if (!controller.state.focus) {
                        // Focus the window
                        controller.focus();
                    }
                    return;
                }
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (e.target.classList !== undefined
            && e.target.classList.contains('elara-window')
            && !self.engine.hasSession()) {
            const window = e.target;
            const windowRect = window.getBoundingClientRect();

            // Get the relative cursor position and window size
            const relativeX = e.pageX - windowRect.left;
            const relativeY = e.pageY - windowRect.top;
            const windowWidth = windowRect.width;
            const windowHeight = windowRect.height;

            // Determine the transform mode for the current cursor position.
            // Use this to determine which cursor to use and set that cursor.
            const modes = self.determineModes(relativeX, relativeY, windowWidth, windowHeight);
            window.style.cursor = self.determineResizeCursor(modes.hmode, modes.vmode);
        }
    });
};

export default WindowMovement;
