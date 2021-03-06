import svgUtil from '../../shared/scripts/SvgUtil';

// constructor: ToolbarDropdownMenu
function ToolbarDropdownMenu(parent, title, items) {
    this.parent = parent;
    this.title = title;
    this.items = items;

    //
    this.dropdownButton = null;
}

// Construct the dropdown menu
ToolbarDropdownMenu.prototype.construct = function construct() {
    // Create the elements
    const dropdownButton = document.createElement('div');
    const button = document.createElement('div');
    const items = document.createElement('div');

    // Add the classes
    dropdownButton.className = 'elara-dropdown-button';
    button.className = 'elara-button';
    items.className = 'elara-dropdown-items';

    // Set the title
    button.innerText = this.title;

    // Combine the elemnent
    dropdownButton.appendChild(button);
    dropdownButton.appendChild(items);

    // Store a reference to the element
    this.dropdownButton = dropdownButton;

    // Bind the button click
    const self = this;
    button.addEventListener('click', () => {
        self.open();
    });

    return dropdownButton;
};

// Construct a dropdown menu button
ToolbarDropdownMenu.prototype.constructButton = function constructButton(button) {
    const self = this;

    // Create the elements
    const buttonElement = document.createElement('div');
    const label = document.createElement('div');

    // Add the classes
    buttonElement.className = 'elara-menu-button';
    label.className = 'elara-menu-button-label';

    // Set the button title text
    label.innerText = button.title;

    // Add the icon and its container if defined
    if (button.icon !== undefined) {
        const icon = document.createElement('div');
        icon.className = 'elara-button-icon-container';
        icon.appendChild(svgUtil.createSvgElement(button.icon, 16, 16));
        buttonElement.appendChild(icon);
    }

    // Add the title label to the button element
    buttonElement.appendChild(label);

    // Bind the click event of the new button
    buttonElement.addEventListener('click', () => {
        // Invoke the click handler of the button
        const result = button.click();

        // Close the menu if the result is not true
        if (result !== true) {
            self.close();
        }
    });

    return buttonElement;
};

// Open the dropdown menu.
// Close if it's already opened.
ToolbarDropdownMenu.prototype.open = function open() {
    if (this.dropdownButton.classList.contains('opened')) {
        // Close the menu if it's clicked again
        this.close();
    }
    else {
        // Close all menu's
        this.parent.closeAll();

        // Add the "opened" class to show the buttons
        this.dropdownButton.classList.add('opened');

        // Get the buttons container
        const buttons = this.dropdownButton.querySelector('.elara-dropdown-items');

        // Construct the buttons and add them to the container
        for (let i = 0; i < this.items.length; i++) {
            buttons.appendChild(this.constructButton(this.items[i]));
        }
    }
};

// Close the dropdown
ToolbarDropdownMenu.prototype.close = function close() {
    if (this.dropdownButton.classList.contains('opened')) {
        const items = this.dropdownButton.querySelectorAll('.elara-dropdown-items');
        for (let j = 0; j < items.length; j++) {
            items[j].innerHTML = '';
        }
        this.dropdownButton.classList.remove('opened');
    }
};

// Update the menu items
ToolbarDropdownMenu.prototype.updateItems = function updateItems(items) {
    this.items = items;
};

export default ToolbarDropdownMenu;
