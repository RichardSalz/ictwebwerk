const thumbnails = document.querySelectorAll('.thumbnailpicture');
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    thumbnails.forEach((thumbnail, i) => {
      if (i === index) {
        thumbnail.classList.remove('thumbnail-hidden');
      } else {
        thumbnail.classList.add('thumbnail-hidden');
      }
    });
  });
});
