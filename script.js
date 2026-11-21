// RoboFriend — wariant "warm-hybrid"

document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Technologia — kliknięcie w dowolne miejsce kafelka rozwija/zwija TEN kafelek.
  // Wysokość wszystkich kafelków jest wspólna (styles.css: .tech-grid), więc rozwinięcie
  // kolejnego kafelka nie wydłuża strony, jeśli jego treść mieści się w już zajętym miejscu.
  document.querySelectorAll('.tech-card').forEach((card) => {
    const box = card.querySelector('details.more-box');
    if (!box) return;
    card.addEventListener('click', (e) => {
      // summary obsługuje się sam; klik w rozwiniętą treść (np. zaznaczanie tekstu) nie zwija
      if (e.target.closest('summary') || e.target.closest('.more-body')) return;
      box.open = !box.open;
    });
  });

  // Tab navigation — buttons swap the visible content panel, no page reload
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const panelIds = Array.from(tabPanels).map((panel) => panel.id);

  const tabBarNav = document.getElementById('tab-bar-nav');

  const activateTab = (id) => {
    if (!panelIds.includes(id)) return;
    tabPanels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
    // podstrony (np. artykuły) podświetlają zakładkę nadrzędną z data-parent
    const activePanel = document.getElementById(id);
    const tabId = (activePanel && activePanel.dataset.parent) || id;
    tabButtons.forEach((btn) => {
      const isActive = btn.getAttribute('href') === '#' + tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    if (tabBarNav) {
      tabBarNav.hidden = id === 'glowna';
    }
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    if (!panelIds.includes(id)) return;
    link.addEventListener('click', () => activateTab(id));
  });

  window.addEventListener('hashchange', () => {
    activateTab(location.hash.slice(1));
  });

  const initialId = location.hash.slice(1);
  activateTab(panelIds.includes(initialId) ? initialId : panelIds[0]);

  // Kontakt form — opens the visitor's mail client with a pre-filled message
  const kontaktForm = document.getElementById('kontakt-form');
  if (kontaktForm) {
    kontaktForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('kontakt-name').value.trim();
      const email = document.getElementById('kontakt-email').value.trim();
      const message = document.getElementById('kontakt-message').value.trim();

      const subject = encodeURIComponent(
        name ? `Wiadomość ze strony RoboFriend od ${name}` : 'Wiadomość ze strony RoboFriend'
      );
      const bodyLines = [];
      if (name) bodyLines.push(`Imię i nazwisko: ${name}`);
      if (email) bodyLines.push(`E-mail: ${email}`);
      if (name || email) bodyLines.push('');
      bodyLines.push(message);
      const body = encodeURIComponent(bodyLines.join('\n'));

      window.location.href = `mailto:krystian.skrzypalik@robofriendstech.pl?subject=${subject}&body=${body}`;
    });
  }

  // Formularze rezerwacji i partnerski (.site-form) — lokalnie na stronie, bez Google Forms / Tally.
  // Strona jest statyczna (bez serwera), więc zgłoszenie trafia do programu pocztowego
  // odwiedzającego jako gotowa wiadomość. Docelowo (WordPress) podmienić sendSiteForm()
  // na wysyłkę do formularza po stronie serwera.
  const SITE_FORM_EMAIL = 'krystian.skrzypalik@robofriendstech.pl';

  const sendSiteForm = (formName, lines) => {
    const subject = encodeURIComponent(`${formName} — zgłoszenie ze strony`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${SITE_FORM_EMAIL}?subject=${subject}&body=${body}`;
  };

  document.querySelectorAll('.site-form').forEach((form) => {
    const errorBox = form.querySelector('.form-error');
    const thanksBox = form.querySelector('.form-thanks');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      thanksBox.hidden = true;

      // walidacja pól wymaganych (w tym grupy radio i zgody)
      let firstInvalid = null;
      form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
      form.querySelectorAll('[required]').forEach((field) => {
        const ok = field.type === 'radio'
          ? !!form.querySelector(`input[name="${field.name}"]:checked`)
          : field.checkValidity();
        if (!ok) {
          const target = field.closest('.form-choice') || field;
          target.classList.add('is-invalid');
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (firstInvalid) {
        errorBox.hidden = false;
        firstInvalid.focus();
        return;
      }
      errorBox.hidden = true;

      // treść wiadomości: „Pole: wartość”, wiele wartości (checkboxy) łączone przecinkiem
      const data = new FormData(form);
      const values = {};
      data.forEach((value, key) => {
        const v = String(value).trim();
        if (!v) return;
        values[key] = values[key] ? `${values[key]}, ${v}` : v;
      });
      const lines = Object.entries(values).map(([key, value]) => `${key}: ${value}`);

      sendSiteForm(form.dataset.formName, lines);
      thanksBox.hidden = false;
      form.reset();
    });
  });

  // „Przejdź do formularza ↓” — płynne przewinięcie bez zmiany adresu (#) w pasku
  document.querySelectorAll('.form-jump').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Footer copyright year — always current, no manual updates needed
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});
