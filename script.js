(() => {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Home music control.
  // Browsers block autoplay-with-sound, so Home starts muted and sound is enabled
  // only after an explicit user click.
  const homeVideo = document.querySelector('#home-video');
  const homeSoundToggle = document.querySelector('#home-sound-toggle');
  const homeSoundLabel = homeSoundToggle?.querySelector('.sound-label');

  function renderHomeSoundState() {
    if (!homeVideo || !homeSoundToggle || !homeSoundLabel) return;
    const isOn = !homeVideo.muted && homeVideo.volume > 0;

    homeSoundToggle.classList.toggle('is-on', isOn);
    homeSoundToggle.setAttribute('aria-pressed', String(isOn));
    homeSoundToggle.setAttribute(
      'aria-label',
      isOn ? 'Turn Home music off' : 'Turn Home music on'
    );
    homeSoundLabel.textContent = isOn ? 'SOUND ON' : 'SOUND OFF';
  }

  if (homeVideo && homeSoundToggle) {
    homeVideo.muted = true;
    homeVideo.volume = 1;
    renderHomeSoundState();

    homeSoundToggle.addEventListener('click', async () => {
      const turnOn = homeVideo.muted || homeVideo.volume === 0;

      if (turnOn) {
        if (zenVideo) zenVideo.muted = true;
        homeVideo.muted = false;
        homeVideo.volume = 1;
        try {
          await homeVideo.play();
        } catch {
          // If playback was interrupted, keep UI in sync with actual state.
        }
      } else {
        homeVideo.muted = true;
      }

      renderHomeSoundState();
    });

    homeVideo.addEventListener('volumechange', renderHomeSoundState);
  }

  // Zen welcome sound control.
  // The video starts muted for reliable autoplay. Sound begins only after a user click.
  const zenVideo = document.querySelector('#zen-video');
  const zenSoundToggle = document.querySelector('#zen-sound-toggle');
  const zenSoundLabel = zenSoundToggle?.querySelector('.sound-label');

  function renderZenSoundState() {
    if (!zenVideo || !zenSoundToggle || !zenSoundLabel) return;
    const isOn = !zenVideo.muted && zenVideo.volume > 0;
    zenSoundToggle.classList.toggle('is-on', isOn);
    zenSoundToggle.setAttribute('aria-pressed', String(isOn));
    zenSoundToggle.setAttribute(
      'aria-label',
      isOn ? 'Turn Zen welcome sound off' : 'Turn Zen welcome sound on'
    );
    zenSoundLabel.textContent = isOn ? 'SOUND ON' : 'SOUND OFF';
  }

  if (zenVideo && zenSoundToggle) {
    zenVideo.muted = true;
    zenVideo.volume = 1;
    renderZenSoundState();

    zenSoundToggle.addEventListener('click', async () => {
      const turnOn = zenVideo.muted || zenVideo.volume === 0;

      if (turnOn) {
        // Avoid overlapping audio if the Home video is still partially visible.
        if (homeVideo) homeVideo.muted = true;
        zenVideo.muted = false;
        zenVideo.volume = 1;
        try {
          await zenVideo.play();
        } catch {}
      } else {
        zenVideo.muted = true;
      }

      renderHomeSoundState();
      renderZenSoundState();
    });

    zenVideo.addEventListener('volumechange', renderZenSoundState);
  }


  const horizontal = document.querySelector('#horizontal-story');
  const track = document.querySelector('.horizontal-track');
  const slideShells = [...document.querySelectorAll('.slide-shell')];
  const desktop = window.matchMedia('(min-width: 901px)');

  function stageMetrics() {
    if (!horizontal) return { start:0, distance:1 };
    return {
      start: horizontal.offsetTop,
      distance: Math.max(1, horizontal.offsetHeight - window.innerHeight)
    };
  }

  function horizontalProgress() {
    const { start, distance } = stageMetrics();
    return clamp((window.scrollY - start) / distance, 0, 1);
  }

  function updateHorizontal() {
    if (!track) return;

    if (!desktop.matches) {
      track.style.transform = '';
      slideShells.forEach(s => {
        s.style.setProperty('--slide-opacity', '1');
        s.style.setProperty('--slide-shift', '0px');
        s.style.setProperty('--slide-scale', '1');
      });
      return;
    }

    const p = horizontalProgress();
    const position = p * 3; // 0=MM, 1=Baby QA, 2=Services, 3=Release
    track.style.transform = `translate3d(${-p * 300}vw,0,0)`;

    slideShells.forEach((shell, index) => {
      const d = Math.abs(position - index);
      const opacity = clamp(1 - d * 0.78, 0.20, 1);
      const shift = (index - position) * 34;
      const scale = 1 - clamp(d, 0, 1) * 0.018;
      shell.style.setProperty('--slide-opacity', opacity.toFixed(3));
      shell.style.setProperty('--slide-shift', `${shift.toFixed(1)}px`);
      shell.style.setProperty('--slide-scale', scale.toFixed(4));
    });
  }

  // Cinematic fade-in/out for vertical scenes.
  const fadeScenes = [...document.querySelectorAll('.fade-scene')];
  function updateSceneFades() {
    const vh = window.innerHeight || 1;
    fadeScenes.forEach(scene => {
      const r = scene.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - vh / 2);
      const normalized = clamp(dist / (vh * 0.86), 0, 1);
      const opacity = 1 - normalized * 0.70;
      const y = normalized * 16;
      scene.style.setProperty('--scene-opacity', opacity.toFixed(3));
      scene.style.setProperty('--scene-y', `${y.toFixed(1)}px`);
    });
  }

  // Lower-content reveal.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-block').forEach(el => observer.observe(el));

  // Media playback management.
  const mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        const promise = v.play();
        if (promise && promise.catch) promise.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('video').forEach(v => mediaObserver.observe(v));

  // Scroll to the correct point inside the pinned horizontal stage.
  function scrollToHorizontalPanel(index) {
    if (!horizontal || !desktop.matches) {
      const ids = ['#music-meter', '#baby-qa', '#creator-services', '#release-record'];
      const id = ids[index] || '#music-meter';
      document.querySelector(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    const { start, distance } = stageMetrics();
    const p = index / 3;
    window.scrollTo({ top: start + distance * p, behavior:'smooth' });
  }

  // Links baked into video: make their invisible overlays actually work.
  document.querySelector('.services-hotspot')?.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  // Production contact form: sends directly through the Cloudflare Pages Function.
  const contactForm = document.querySelector('#contact-form');
  const contactSubmit = document.querySelector('#contact-submit');
  const formStatus = document.querySelector('#form-status');

  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      name: document.querySelector('#name')?.value.trim() || '',
      email: document.querySelector('#email')?.value.trim() || '',
      service: document.querySelector('#service')?.value || '',
      message: document.querySelector('#message')?.value.trim() || '',
      website: document.querySelector('#website')?.value.trim() || ''
    };

    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = 'Sending request…';
    }
    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.textContent = 'SENDING…';
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let result = {};
      try {
        result = await response.json();
      } catch {}

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Request could not be sent.');
      }

      contactForm.reset();

      if (formStatus) {
        formStatus.className = 'form-status is-success';
        formStatus.textContent = 'Request sent. PulseLore Studio will reply by email.';
      }
    } catch (error) {
      if (formStatus) {
        formStatus.className = 'form-status is-error';
        formStatus.textContent =
          'Could not send right now. Please email contact@pulselore.studio.';
      }
    } finally {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.textContent = 'SEND REQUEST';
      }
    }
  });


  // Soft 3D movement for HTML cards. Mouse/pen follows the pointer;
  // touch gets a brief press response without interfering with page scroll.
  const tiltCards = [...document.querySelectorAll('.tilt-card')];
  const finePointer = window.matchMedia('(pointer:fine)');

  tiltCards.forEach(card => {
    const maxTilt =
      card.classList.contains('portfolio-card') ? 5.0 :
      card.classList.contains('media-tilt-card') ? 2.0 :
      card.classList.contains('cassette-tilt-card') ? 3.6 :
      3.0;

    function resetTilt() {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }

    card.addEventListener('pointermove', event => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = (event.clientY - rect.top) / Math.max(1, rect.height);
      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;

      if (card.classList.contains('portfolio-card')) {
        card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
      } else {
        card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
      }
    });

    card.addEventListener('pointerleave', resetTilt);

    card.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') {
        card.classList.add('is-touch-pressed');
      }
    });

    card.addEventListener('pointerup', () => {
      card.classList.remove('is-touch-pressed');
    });
    card.addEventListener('pointercancel', () => {
      card.classList.remove('is-touch-pressed');
      resetTilt();
    });
  });

  let ticking = false;
  function update() {
    updateHorizontal();
    updateSceneFades();
    ticking = false;
  }
  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive:true });
  window.addEventListener('resize', requestUpdate);
  desktop.addEventListener?.('change', requestUpdate);

  update();
})();