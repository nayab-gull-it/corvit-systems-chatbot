// Corvit Systems - Landing Page Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Course Category Filtering
  const filterButtons = document.querySelectorAll('.course-filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-red-600', 'text-white', 'shadow-md');
        b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
      });

      btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
      btn.classList.add('bg-red-600', 'text-white', 'shadow-md');

      const filter = btn.getAttribute('data-filter');

      courseCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 3. Quick Inquiry Form Submission Handler
  const inquiryForm = document.getElementById('quick-inquiry-form');
  const formSuccessAlert = document.getElementById('form-success-alert');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Submitting Inquiry...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        inquiryForm.reset();

        if (formSuccessAlert) {
          formSuccessAlert.classList.remove('hidden');
          setTimeout(() => {
            formSuccessAlert.classList.add('hidden');
          }, 6000);
        }
      }, 1000);
    });
  }

  // 4. Connect Course Cards to Chatbot
  const askBotButtons = document.querySelectorAll('.ask-bot-btn');
  askBotButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseTitle = btn.getAttribute('data-course-title') || 'this course';
      const prompt = `Tell me more about ${courseTitle}: what are the prerequisites, timetable options, and how do I apply?`;
      
      // Open chatbot widget and send prompt if chat module is loaded
      if (typeof window.openChatWithPrompt === 'function') {
        window.openChatWithPrompt(prompt);
      } else {
        const chatWidget = document.getElementById('chatbot-widget');
        if (chatWidget) {
          chatWidget.classList.remove('widget-closed');
          chatWidget.classList.add('widget-open');
        }
      }
    });
  });

  // 5. FAQ Accordion Toggle
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector('.faq-icon');
      const isOpen = !content.classList.contains('hidden');

      // Close other open faqs
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
});
