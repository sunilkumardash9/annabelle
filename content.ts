// // Console log for debugging
// console.log('content loaded');

// // Function to create a button with type annotations
// function createButton(text: string): HTMLButtonElement {
//   const button = document.createElement('button');
//   button.textContent = text;
//   button.style.backgroundColor = '#084dbd';
//   button.style.color = 'white';
//   button.style.border = 'none';
//   button.style.borderRadius = '100px';
//   button.style.padding = '5px 10px';
//   button.style.marginRight = '10px'; // Space between buttons
//   button.style.cursor = 'pointer';
//   return button;
// }

// // Create a div to hold the buttons, specifying its type
// const buttonContainer: HTMLDivElement = document.createElement('div');
// buttonContainer.style.position = 'absolute';
// buttonContainer.style.display = 'none'; // Initially hidden
// document.body.appendChild(buttonContainer);

// // Create two buttons and add them to the container
// const button1 = createButton('Button 1');
// const button2 = createButton('Button 2');
// buttonContainer.appendChild(button1);
// buttonContainer.appendChild(button2);

// // Function to position the button container near the selected text
// function positionButtonContainer() {
//   const selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   const range = selection.getRangeAt(0);
//   const rect = range.getBoundingClientRect();

//   // Position the container slightly above and to the right of the selection
//   const topOffset = -40; // Adjust this value as needed
//   const leftOffset = -145; // Adjust this value as needed
//   buttonContainer.style.top = `${rect.top + window.scrollY + topOffset}px`;
//   buttonContainer.style.left = `${rect.right + window.scrollX + leftOffset}px`;
// }

// // Event listeners with explicit types for events and callbacks
// document.addEventListener('mouseup', (event: MouseEvent) => {
//   const selectedText = window.getSelection().toString().trim();
//   if (selectedText.length > 0) {
//     positionButtonContainer();
//     buttonContainer.style.display = 'block';
//   } else {
//     buttonContainer.style.display = 'none';
//   }
// });

// window.addEventListener('scroll', (event: Event) => {
//   if (buttonContainer.style.display === 'block') {
//     positionButtonContainer();
//   }
// });
