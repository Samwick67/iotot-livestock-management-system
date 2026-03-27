function showMessage(page) {
  alert("You clicked on " + page + " page. Later this will fetch DB data.");
}

const items = document.querySelectorAll('.carousel-item');
const dotsContainer = document.getElementById('dotsContainer');
let currentIndex = 0;

// Create dots dynamically
items.forEach((_, i) => {
  const dot = document.createElement('span'); // span matches CSS
  if(i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => { goToSlide(i); });
  dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('span');

function updateCarousel() {
  items.forEach((item, i) => item.classList.toggle('active', i === currentIndex));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
}

function goToSlide(index) {
  currentIndex = index;
  updateCarousel();
}

// Auto slide every 5 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % items.length;
  updateCarousel();
}, 5000);

// Back to top button
const backToTop = document.getElementById('backToTop');

window.onscroll = () => {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
};

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Policy modal
const modal = document.getElementById('policyModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.querySelector('.close');

document.querySelectorAll('.policy-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const policy = link.dataset.policy;
    modalTitle.textContent = policy === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
    modalText.textContent = policy === 'privacy' 
      ? 'This is a placeholder Privacy Policy. Replace with your actual privacy text.' 
      : 'This is a placeholder Terms of Service. Replace with your actual terms text.';
    modal.style.display = 'block';
  });
});

closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });
