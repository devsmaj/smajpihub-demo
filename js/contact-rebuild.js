const contactForm = document.getElementById('contactForm');
const formResponse = document.getElementById('formResponse');

if (contactForm && formResponse) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const subject = document.getElementById('subject')?.value.trim();
    const serviceType = document.getElementById('serviceType')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !subject || !serviceType || !message) {
      formResponse.style.color = '#b00020';
      formResponse.textContent = 'Please complete all fields.';
      return;
    }

    formResponse.style.color = '#157347';
    formResponse.textContent = 'Message received. Our team will contact you soon.';
    contactForm.reset();
  });
}