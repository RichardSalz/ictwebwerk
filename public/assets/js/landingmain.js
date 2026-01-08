const logo = document.querySelector('.logo');

//Left side click
const leftElement = document.querySelector('.left');
const leftDesc = document.querySelector('.leftdesc');
const leftTitle = document.querySelector('.lefttitle');

leftElement.addEventListener('click', () => {
  leftElement.classList.toggle('leftexpanded');
  leftElement.classList.add('front');
  leftDesc.classList.toggle('hidden');
});

//Right side click
const rightElement = document.querySelector('.right');
const rightDesc = document.querySelector('.rightdesc');
const rightTitle = document.querySelector('.righttitle');

rightElement.addEventListener('click', () => {
  rightElement.classList.toggle('rightexpanded');
  rightElement.classList.toggle('front');
  rightDesc.classList.toggle('hidden');

  //Check if we need to change the logo 
  checkOverlapAndToggle();
});


//We need to put the right element back to the front 
leftElement.addEventListener('transitionend', (event) => {

  if (event.propertyName === 'right' && !leftElement.classList.contains('leftexpanded') ) {
    leftElement.classList.remove('front');
  }
  // if (event.propertyName === 'right' && leftElement.classList.contains('leftexpanded') ) {
  //   leftTitle.classList.toggle('titleexpanded');  
  // }

  
});

// leftElement.addEventListener('transitionstart', () => {
//   setTimeout(() => {
//     // Code here runs 0.2 seconds (200 ms) after the transition starts
//     leftElement.classList.add('front');
//   }, 100);
// });

//Checks if two elements overlap
function isOverlapping(el1, el2) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom
  );
}

//Toggles the inverse color scheme of the logo 

function checkOverlapAndToggle() {
  if (isOverlapping(rightElement, logo)) {
    logo.classList.add('inverse-colors');
  } else {
    logo.classList.remove('inverse-colors');
  }
  requestAnimationFrame(checkOverlapAndToggle);
}

checkOverlapAndToggle();


