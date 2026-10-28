/**
 * White & Black Aquasports - Interactive Client Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================
  // Splash Screen Controller (~3s presentation on every load/reload)
  // ==========================================================
  const splashScreen = document.getElementById('siteSplashScreen');
  if (splashScreen) {
    document.body.classList.add('splash-screen-active');
    const progressBar = document.getElementById('splashProgressBar');
    const progressVal = document.getElementById('splashProgressVal');

    const totalAnimDuration = 2400; // Progress bar fills over 2.4s
    const startTime = performance.now();

    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / totalAnimDuration, 1);
      // Smooth ease out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 2.5);
      const percent = Math.min(Math.round(eased * 100), 100);

      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressVal) progressVal.textContent = `${percent}%`;

      if (progressRatio < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        if (progressBar) progressBar.style.width = '100%';
        if (progressVal) progressVal.textContent = '100%';

        // Hold full state briefly then initiate fade-out at ~2.7s for ~3.0s total screen time
        setTimeout(() => {
          splashScreen.classList.add('fade-out');
          document.body.classList.remove('splash-screen-active');

          setTimeout(() => {
            splashScreen.style.display = 'none';
          }, 450);
        }, 300);
      }
    };

    requestAnimationFrame(updateProgress);
  }

  // Navigation & ScrollSpy
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = navMenu ? navMenu.querySelectorAll('.nav-link') : [];

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // Ensure background panorama videos autoplay smoothly across all pages
  const panoramaVideos = document.querySelectorAll('.home-panorama-video, .branch-panorama-video');
  panoramaVideos.forEach(panoramaVideo => {
    panoramaVideo.muted = true;
    const playPromise = panoramaVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const startVideo = () => {
          panoramaVideo.play().catch(() => { });
        };
        document.addEventListener('touchstart', startVideo, { once: true });
        document.addEventListener('click', startVideo, { once: true });
      });
    }
  });

  let isClickScrolling = false;
  let clickScrollTimer = null;

  // Handle clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      isClickScrolling = true;
      if (clickScrollTimer) clearTimeout(clickScrollTimer);
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false;
      }, 800);

      if (navMenu) navMenu.classList.remove('open');
      if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    });
  });

  // Handle clicking "View Rates" button
  const viewRatesBtns = document.querySelectorAll('a[href="#locations"]');
  viewRatesBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const branchLink = navMenu ? navMenu.querySelector('a[href="#locations"]') : null;
      if (branchLink) {
        navLinks.forEach(l => l.classList.remove('active'));
        branchLink.classList.add('active');
      }
      isClickScrolling = true;
      if (clickScrollTimer) clearTimeout(clickScrollTimer);
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false;
      }, 800);
      if (navMenu) navMenu.classList.remove('open');
    });
  });

  // ScrollSpy: dynamically activate the nav tab corresponding to current section
  const scrollSections = [
    { id: 'home', navId: 'home', el: document.getElementById('home') },
    { id: 'locations', navId: 'locations', el: document.getElementById('locations') },
    { id: 'teambuilding', navId: 'teambuilding', el: document.getElementById('teambuilding') },
    { id: 'gallery', navId: 'gallery', el: document.getElementById('gallery') },
    { id: 'roadmap', navId: 'roadmap', el: document.getElementById('roadmap') },
    { id: 'safety', navId: 'safety', el: document.getElementById('safety') },
    { id: 'faq', navId: 'safety', el: document.querySelector('.faq-section') },
    { id: 'contact', navId: 'contact', el: document.getElementById('contact') }
  ].filter(item => item.el !== null);

  function updateScrollSpy() {
    if (isClickScrolling) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // If near the bottom of the page, activate Contact & Map
    if (scrollY + windowHeight >= documentHeight - 80) {
      setActiveNav('contact');
      return;
    }

    // Offset for sticky header and top banner
    const offset = 180;
    let currentNavId = 'home';

    for (let i = 0; i < scrollSections.length; i++) {
      const section = scrollSections[i].el;
      const top = section.offsetTop - offset;
      if (scrollY >= top) {
        currentNavId = scrollSections[i].navId;
      }
    }

    setActiveNav(currentNavId);
  }

  function setActiveNav(navId) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${navId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();

  // Gallery Lightbox Preview
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  if (lightbox && lightboxImg && lightboxCaption) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || (img ? img.alt : '');
        if (img) {
          lightboxImg.src = img.src;
          lightboxCaption.textContent = caption;
          lightbox.classList.add('open');
          lightbox.setAttribute('aria-hidden', 'false');
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
    };

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  // Branch Chooser Popups (Instagram & WhatsApp)
  const instagramModal = document.getElementById('instagramBranchModal');
  const whatsappModal = document.getElementById('whatsappBranchModal');
  const footerInstagramBtn = document.getElementById('footerInstagramBtn');
  const footerWhatsappBtn = document.getElementById('footerWhatsappBtn');
  const footerDirectWhatsappLink = document.getElementById('footerDirectWhatsappLink');
  const floatingWhatsappBtn = document.getElementById('floatingWhatsappBtn');
  const closeInstagramModalBtn = document.getElementById('closeInstagramModalBtn');
  const closeWhatsappModalBtn = document.getElementById('closeWhatsappModalBtn');

  function openBranchModal(modal, triggerBtn) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeBranchModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    const anyOpen = document.querySelector('.branch-modal-backdrop.open, .gallery-lightbox-modal.open');
    if (!anyOpen) {
      document.body.style.overflow = '';
    }
    if (footerInstagramBtn) footerInstagramBtn.setAttribute('aria-expanded', 'false');
    if (footerWhatsappBtn) footerWhatsappBtn.setAttribute('aria-expanded', 'false');
    if (floatingWhatsappBtn) floatingWhatsappBtn.setAttribute('aria-expanded', 'false');
  }

  // Instagram Popup Triggers
  if (footerInstagramBtn) {
    footerInstagramBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBranchModal(instagramModal, footerInstagramBtn);
    });
  }

  // WhatsApp Popup Triggers
  if (footerWhatsappBtn) {
    footerWhatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBranchModal(whatsappModal, footerWhatsappBtn);
    });
  }

  if (floatingWhatsappBtn) {
    floatingWhatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBranchModal(whatsappModal, floatingWhatsappBtn);
    });
  }

  if (footerDirectWhatsappLink) {
    footerDirectWhatsappLink.addEventListener('click', (e) => {
      e.preventDefault();
      openBranchModal(whatsappModal, footerDirectWhatsappLink);
    });
  }

  // Close Buttons
  if (closeInstagramModalBtn) {
    closeInstagramModalBtn.addEventListener('click', () => closeBranchModal(instagramModal));
  }

  if (closeWhatsappModalBtn) {
    closeWhatsappModalBtn.addEventListener('click', () => closeBranchModal(whatsappModal));
  }

  // Backdrop click & Option link click
  [instagramModal, whatsappModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBranchModal(modal);
      }
    });

    const optionLinks = modal.querySelectorAll('.branch-option-card');
    optionLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => closeBranchModal(modal), 150);
      });
    });
  });

  // Global Escape Key Listener for Branch Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (instagramModal && instagramModal.classList.contains('open')) closeBranchModal(instagramModal);
      if (whatsappModal && whatsappModal.classList.contains('open')) closeBranchModal(whatsappModal);
    }
  });

  // Citizen vs Non-Citizen Price Toggle
  const citizenToggles = document.querySelectorAll('.citizen-toggle-control button');
  let currentTier = 'citizen'; // 'citizen' or 'non-citizen'

  citizenToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      if (!tier) return;
      currentTier = tier;

      // Update active state in all toggle button groups
      document.querySelectorAll('.citizen-toggle-control button').forEach(b => {
        if (b.getAttribute('data-tier') === tier) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Update all price elements
      updatePrices();
    });
  });

  function updatePrices() {
    const priceElements = document.querySelectorAll('.price-dynamic');
    priceElements.forEach(el => {
      const citizenPrice = el.getAttribute('data-citizen');
      const nonCitizenPrice = el.getAttribute('data-non-citizen');

      const newPrice = currentTier === 'citizen' ? citizenPrice : nonCitizenPrice;
      if (newPrice) {
        el.textContent = newPrice;
        if (newPrice.toLowerCase() === 'f.o.c' || newPrice.toLowerCase() === 'free') {
          el.classList.add('free');
        } else {
          el.classList.remove('free');
        }
      }
    });
  }

  // Location Tab Switcher (All / Titiwangsa / Ripplebay)
  const locTabBtns = document.querySelectorAll('.loc-tab-btn');
  const locationCards = document.querySelectorAll('.location-showcase-card');

  locTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLoc = btn.getAttribute('data-location-target');

      locTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      locationCards.forEach(card => {
        const cardLoc = card.getAttribute('data-location-id');
        if (targetLoc === 'all' || cardLoc === targetLoc) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Check and Display Live Open/Closed Status
  function evaluateLiveStatus() {
    // Current time in Malaysia (UTC+8)
    const now = new Date();
    // UTC time + 8 hours
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const myTime = new Date(utc + (3600000 * 8));

    const day = myTime.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
    const hours = myTime.getHours();
    const minutes = myTime.getMinutes();
    const currentTimeDec = hours + (minutes / 60);

    // Titiwangsa Status:
    // Mon: Closed
    // Tue-Thu: 10:00 to 19.25 (Break: 13:00 - 15:00)
    // Fri: 10:00 to 21.25 (Break: 13:00 - 15:00)
    // Sat-Sun: 08:00 to 21.25 (No break)
    let titiwangsaStatus = { open: false, text: 'Closed' };
    if (day === 1) {
      titiwangsaStatus = { open: false, text: 'Closed (Every Monday)' };
    } else if (day >= 2 && day <= 4) {
      if (currentTimeDec >= 13 && currentTimeDec < 15) {
        titiwangsaStatus = { open: false, text: 'Break (Reopens at 3:00 PM)' };
      } else if (currentTimeDec >= 10 && currentTimeDec < 19.25) {
        titiwangsaStatus = { open: true, text: 'Open Today until 7:15 PM' };
      } else {
        titiwangsaStatus = { open: false, text: 'Closed (Opens 10:00 AM)' };
      }
    } else if (day === 5) {
      if (currentTimeDec >= 13 && currentTimeDec < 15) {
        titiwangsaStatus = { open: false, text: 'Break (Reopens at 3:00 PM)' };
      } else if (currentTimeDec >= 10 && currentTimeDec < 21.25) {
        titiwangsaStatus = { open: true, text: 'Open Today until 9:15 PM' };
      } else {
        titiwangsaStatus = { open: false, text: 'Closed (Opens 10:00 AM)' };
      }
    } else { // Sat & Sun
      if (currentTimeDec >= 8 && currentTimeDec < 21.25) {
        titiwangsaStatus = { open: true, text: 'Open Today until 9:15 PM' };
      } else {
        titiwangsaStatus = { open: false, text: 'Closed (Opens 8:00 AM)' };
      }
    }

    // Ripplebay Status:
    // Mon: Closed
    // Weekday (Tue-Thu): 10:00 to 20:00
    // Fri: 10:00 to 22:00
    // Weekend (Sat-Sun): 08:00 to 22:00
    let ripplebayStatus = { open: false, text: 'Closed' };
    if (day === 1) {
      ripplebayStatus = { open: false, text: 'Closed (Every Monday)' };
    } else if (day >= 2 && day <= 4) {
      if (currentTimeDec >= 10 && currentTimeDec < 20) {
        ripplebayStatus = { open: true, text: 'Open Today until 8:00 PM' };
      } else {
        ripplebayStatus = { open: false, text: 'Closed (Opens 10:00 AM)' };
      }
    } else if (day === 5) {
      if (currentTimeDec >= 10 && currentTimeDec < 22) {
        ripplebayStatus = { open: true, text: 'Open Today until 10:00 PM' };
      } else {
        ripplebayStatus = { open: false, text: 'Closed (Opens 10:00 AM)' };
      }
    } else { // Sat & Sun
      if (currentTimeDec >= 8 && currentTimeDec < 22) {
        ripplebayStatus = { open: true, text: 'Open Today until 10:00 PM' };
      } else {
        ripplebayStatus = { open: false, text: 'Closed (Opens 8:00 AM)' };
      }
    }

    // Update UI elements
    const titiStatusEl = document.getElementById('titiwangsaStatusBadge');
    const rippleStatusEl = document.getElementById('ripplebayStatusBadge');

    if (titiStatusEl) {
      titiStatusEl.className = titiwangsaStatus.open ? 'badge-open' : 'badge-closed';
      titiStatusEl.textContent = (titiwangsaStatus.open ? '● ' : '○ ') + titiwangsaStatus.text;
    }

    if (rippleStatusEl) {
      rippleStatusEl.className = ripplebayStatus.open ? 'badge-open' : 'badge-closed';
      rippleStatusEl.textContent = (ripplebayStatus.open ? '● ' : '○ ') + ripplebayStatus.text;
    }
  }

  evaluateLiveStatus();

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const panel = item.querySelector('.faq-answer-panel');

    if (btn && panel) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close others
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherPanel = other.querySelector('.faq-answer-panel');
          if (otherPanel) otherPanel.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    }
  });

  // Team Building Interactive Calculator
  const paxSlider = document.getElementById('calcPaxSlider');
  const paxValueDisp = document.getElementById('calcPaxValue');
  const packageBoxes = document.querySelectorAll('.calc-radio-box');
  const extraGamesSelect = document.getElementById('calcExtraGames');
  const addWaterCheck = document.getElementById('calcAddWater');
  const add100PlusCheck = document.getElementById('calcAdd100Plus');
  const addSandwichCheck = document.getElementById('calcAddSandwich');

  const totalPaxDisp = document.getElementById('calcSummaryPax');
  const totalCostDisp = document.getElementById('calcSummaryTotal');
  const costPerPaxDisp = document.getElementById('calcSummaryPerPax');
  const whatsappQuoteBtn = document.getElementById('calcWhatsappQuoteBtn');

  let baseRatePerPax = 45; // RM45 for 3 games default
  let currentPackageName = '3 Water Games (RM45/pax)';

  function calculateTeamBuilding() {
    if (!paxSlider) return;

    const pax = parseInt(paxSlider.value, 10);
    if (paxValueDisp) paxValueDisp.textContent = `${pax} Pax`;
    if (totalPaxDisp) totalPaxDisp.textContent = `${pax} Pax`;

    // Additional games: RM 10 per extra game per pax
    const extraGamesCount = extraGamesSelect ? parseInt(extraGamesSelect.value, 10) : 0;
    const extraGamesCost = extraGamesCount * 10;

    // Add-on drinks
    let addOnsPerPax = 0;
    if (addWaterCheck && addWaterCheck.checked) addOnsPerPax += 1.0;
    if (add100PlusCheck && add100PlusCheck.checked) addOnsPerPax += 2.5;
    if (addSandwichCheck && addSandwichCheck.checked) addOnsPerPax += 4.0;

    const pricePerPax = baseRatePerPax + extraGamesCost + addOnsPerPax;
    const grandTotal = pricePerPax * pax;

    if (costPerPaxDisp) costPerPaxDisp.textContent = `RM ${pricePerPax.toFixed(2)}`;
    if (totalCostDisp) totalCostDisp.textContent = `RM ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Update WhatsApp prefilled link
    if (whatsappQuoteBtn) {
      let message = `Hello White & Black Aquasports! I would like to inquire about Team Building for ${pax} pax.\n` +
        `Package: ${currentPackageName}\n` +
        `Extra Games: ${extraGamesCount}\n` +
        `Estimated Total: RM ${grandTotal.toFixed(2)} (RM ${pricePerPax.toFixed(2)}/pax).\n` +
        `Please advise on slot availability. Thank you!`;
      const encodedMsg = encodeURIComponent(message);
      whatsappQuoteBtn.href = `https://wa.me/60136517030?text=${encodedMsg}`;
    }
  }

  if (paxSlider) {
    paxSlider.addEventListener('input', calculateTeamBuilding);
  }

  packageBoxes.forEach(box => {
    box.addEventListener('click', () => {
      packageBoxes.forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');

      const rate = parseFloat(box.getAttribute('data-rate'));
      const pkgName = box.getAttribute('data-package-name');
      if (!isNaN(rate)) {
        baseRatePerPax = rate;
        currentPackageName = pkgName || 'Selected Package';
        calculateTeamBuilding();
      }
    });
  });

  if (extraGamesSelect) extraGamesSelect.addEventListener('change', calculateTeamBuilding);
  if (addWaterCheck) addWaterCheck.addEventListener('change', calculateTeamBuilding);
  if (add100PlusCheck) add100PlusCheck.addEventListener('change', calculateTeamBuilding);
  if (addSandwichCheck) addSandwichCheck.addEventListener('change', calculateTeamBuilding);

  // Initial calculation
  calculateTeamBuilding();

  // Interactive Roadmap Scroll Animation: Gliding Kayak Guide with Alternating Paddle Strokes
  const roadmapSection = document.getElementById('roadmap');
  const roadmapKayak = document.getElementById('roadmapKayak');
  const kayakFrame1 = document.getElementById('kayakFrame1');
  const kayakFrame2 = document.getElementById('kayakFrame2');
  const roadmapProgress = document.getElementById('roadmapLineProgress');
  const roadmapItems = document.querySelectorAll('.roadmap-item');

  if (roadmapSection && roadmapKayak) {
    // Preload both images once into memory so the browser never re-fetches or re-decodes them on scroll
    const preloadImg1 = new Image();
    preloadImg1.src = 'image/kayakRoadmap1.png';
    const preloadImg2 = new Image();
    preloadImg2.src = 'image/kayakRoadmap2.png';

    let ticking = false;
    let activeFrame = 0;

    // Hide & show function: cleanly toggles active image with zero opacity ghosting or flicker
    function showKayakFrame(frameNum) {
      if (activeFrame === frameNum) return;
      activeFrame = frameNum;
      if (kayakFrame1 && kayakFrame2) {
        if (frameNum === 1) {
          kayakFrame1.classList.add('active');
          kayakFrame2.classList.remove('active');
        } else {
          kayakFrame1.classList.remove('active');
          kayakFrame2.classList.add('active');
        }
      }
    }

    const roadmapTrack = document.getElementById('roadmapWaterTrack') || document.querySelector('.roadmap-water-track');

    function updateRoadmapKayak() {
      if (!roadmapTrack) return;
      const trackRect = roadmapTrack.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const screenCenter = windowHeight * 0.5;

      // Start moving down when the top of the roadmap track reaches the center of the user's screen.
      // While scrolling through the roadmap, the kayak stays locked at the vertical center of the screen
      // so the user can clearly see both the top line (past milestones) and bottom line (future roadmap destinations ahead)!
      const targetKayakY = screenCenter - trackRect.top;
      const maxKayakTravel = Math.max(0, trackRect.height - 85);
      const kayakY = Math.max(0, Math.min(maxKayakTravel, targetKayakY));

      // Ultra-smooth rowing cadence:
      // Every 36px of travel down the lake triggers a new paddle stroke:
      // Stroke 1: kayakRoadmap1.png (Left blade in water)
      // Stroke 2: kayakRoadmap2.png (Right blade in water)
      // When scrolling stops at any point, kayakY is stationary and the image STAYS on that stroke.
      const strokeCycle = Math.floor(kayakY / 36) % 2;
      showKayakFrame(strokeCycle === 0 ? 1 : 2);

      // Smooth, natural paddle sway tilt mathematically aligned with stroke cycle
      const paddleTilt = Math.sin((kayakY / 36) * Math.PI) * 3.5;

      roadmapKayak.style.transform = `translate(-50%, ${kayakY}px) rotate(${paddleTilt}deg)`;

      if (roadmapProgress) {
        roadmapProgress.style.height = `${Math.min(trackRect.height, kayakY + 65)}px`;
      }

      // Activate milestone cards as the kayak reaches them at the screen center
      roadmapItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.top <= screenCenter + 50) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateRoadmapKayak);
        ticking = true;
      }
    }, { passive: true });

    // Initial check on load
    showKayakFrame(1);
    updateRoadmapKayak();
  }

  /* ==========================================================================
     3D CYLINDRICAL RUNWAY GALLERY & PADDLE SCROLL TRANSITION
     ========================================================================== */
  const arena = document.getElementById('arena');
  const viewport = document.getElementById('viewport');
  const galleryWrapper = document.getElementById('galleryRunway') || document.querySelector('.gallery-wrapper');
  const heroPaddleAnchor = document.getElementById('heroPaddleAnchor');
  const contactPaddleAnchor = document.getElementById('contactPaddleAnchor');
  const paddleWrapper = document.getElementById('paddleWrapper');
  const paddleInner = document.getElementById('paddleInner');
  const quoteContainer = document.getElementById('quoteContainer');
  const quoteInner = document.getElementById('quoteInner');
  const mainHeader = document.getElementById('mainHeader');
  const popupModal = document.getElementById('popupModal');
  const modalImage = document.getElementById('modalImage');
  const closeBtn = document.getElementById('closeBtn');

  if (arena && viewport && galleryWrapper && heroPaddleAnchor && contactPaddleAnchor && paddleWrapper) {
    const galleryPhotos = [
      'image/gallery1.jpg',
      'image/gallery2.jpg',
      'image/gallery3.jpg',
      'image/gallery4.jpg',
      'image/tb1.jpg',
      'image/tb2.jpg',
      'image/tb3.jpg',
      'image/tb4.jpg',
      'image/crystalDome1.jpg',
      'image/crystalDome2.jpg',
      'image/crystalDome3.jpg',
      'image/nightViewTitiwangsa1.jpg',
      'image/nightViewTitiwangsa2.jpg',
      'image/nightViewTitiwangsa3.jpg',
      'image/titiwangsa.jpg',
      'image/ripplebay.jpg',
      'image/hero.jpg',
      'image/team_building.jpg',
      'image/ripplebayBoatCruise1.jpg',
      'image/ripplebayBuggyService1.jpg'
    ];

    let isModalOpen = false;

    function getResponsiveConfig() {
      const width = window.innerWidth;
      if (width < 600) {
        return {
          columns: 12,
          radius: 360,
          perspective: 320,
          tiers: [-480, -320, -160, 0, 160, 320, 480],
        };
      } else if (width < 1024) {
        return {
          columns: 14,
          radius: 720,
          perspective: 750,
          tiers: [-780, -520, -260, 0, 260, 520, 780],
        };
      } else {
        return {
          columns: 16,
          radius: 1100,
          perspective: 1000,
          tiers: [-1020, -680, -340, 0, 340, 680, 1020],
        };
      }
    }

    function buildGallery() {
      arena.innerHTML = '';
      const config = getResponsiveConfig();
      viewport.style.perspective = `${config.perspective}px`;

      let imgCounter = 0;

      config.tiers.forEach((y, rowIndex) => {
        const stagger = (rowIndex % 2 === 0) ? 0 : (360 / config.columns / 2);

        for (let i = 0; i < config.columns; i++) {
          const angle = (360 / config.columns) * i + stagger;
          const card = document.createElement('div');
          card.className = 'card';
          card.draggable = false;

          card.style.transform = `
            rotateY(${angle}deg)
            translateY(${y}px)
            translateZ(${config.radius}px)
            rotateY(180deg)
          `;

          const currentImgSrc = galleryPhotos[imgCounter % galleryPhotos.length];

          const inner = document.createElement('div');
          inner.className = 'card-inner';

          const img = document.createElement('img');
          img.src = currentImgSrc;
          img.alt = 'White & Black Aquasports Moment';
          img.loading = 'lazy';
          img.draggable = false;
          imgCounter++;

          inner.appendChild(img);
          card.appendChild(inner);

          // Tap to view in modal
          card.addEventListener('click', () => {
            openModal(currentImgSrc);
          });

          arena.appendChild(card);
        }
      });
    }

    function openModal(src) {
      if (!popupModal || !modalImage) return;
      modalImage.src = src;
      popupModal.classList.add('active');
      isModalOpen = true;
    }

    function closeModal() {
      if (!popupModal) return;
      popupModal.classList.remove('active');
      isModalOpen = false;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (popupModal) {
      popupModal.addEventListener('click', (e) => {
        if (e.target === popupModal) closeModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    });

    // Motion Variables
    let rotX = 0;
    let rotY = 0;
    let targetDragRotY = 0;
    let targetDragRotX = 0;

    let cursorNormX = 0;
    let cursorNormY = 0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    const autoSpin = 0.05;

    let tiltX = 0;
    let tiltY = 0;

    // Gyroscope / device tilt
    let deviceTiltX = 0;
    let deviceTiltY = 0;
    let hasGyroscope = false;

    function handleOrientation(e) {
      if (e.beta === null || e.gamma === null) return;
      hasGyroscope = true;
      const pitch = (e.beta - 45);
      const roll = e.gamma;
      deviceTiltX = Math.max(-28, Math.min(28, pitch * 0.7));
      deviceTiltY = Math.max(-35, Math.min(35, roll * 0.8));
    }

    function requestMotionPermission() {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(() => {});
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
    window.addEventListener('touchstart', requestMotionPermission, { once: true });

    // Render loop
    function renderGalleryAnimation() {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      const galleryTop = galleryWrapper.offsetTop;
      const galleryHeight = galleryWrapper.offsetHeight;
      const galleryBottom = galleryTop + galleryHeight - winH;

      const heroRect = heroPaddleAnchor.getBoundingClientRect();
      const heroX = heroRect.left + heroRect.width / 2;
      const heroY = heroRect.top + heroRect.height / 2;

      const contactRect = contactPaddleAnchor.getBoundingClientRect();
      const contactX = contactRect.left + contactRect.width / 2;
      const contactY = contactRect.top + contactRect.height / 2;

      const centerX = winW / 2;
      const centerY = winH / 2;

      const leadSection = document.getElementById('gallery') || document.getElementById('galleryLead');
      const leadTop = leadSection ? leadSection.offsetTop : (galleryTop - winH);

      let currentX, currentY, currentRotation;
      let isInGalleryZone = false;
      let shouldShowPaddle = false;

      if (scrollY < leadTop - winH * 0.5) {
        // Above lead section
        shouldShowPaddle = false;
        currentX = heroX;
        currentY = heroY;
        currentRotation = 0;
      } else if (scrollY <= leadTop) {
        // On lead section, resting in hero anchor
        shouldShowPaddle = true;
        currentX = heroX;
        currentY = heroY;
        currentRotation = 0;
      } else if (scrollY <= galleryTop) {
        // Stage 1: Lead Station -> Gallery Center (0° -> 90°)
        shouldShowPaddle = true;
        const scrollRange1 = Math.max(1, galleryTop - leadTop);
        const progress1 = Math.min(Math.max((scrollY - leadTop) / scrollRange1, 0), 1);

        currentX = heroX + (centerX - heroX) * progress1;
        currentY = heroY + (centerY - heroY) * progress1;
        currentRotation = progress1 * 90;

        if (progress1 >= 0.95) isInGalleryZone = true;
      } else if (scrollY > galleryTop && scrollY <= galleryBottom) {
        // Stage 2: Locked in Gallery Center (90°)
        shouldShowPaddle = true;
        currentX = centerX;
        currentY = centerY;
        currentRotation = 90;
        isInGalleryZone = true;
      } else {
        // Stage 3: Gallery Center -> Kayak Man Hands (90° -> 180°)
        const kayakDocTop = contactRect.top + scrollY;
        const targetScroll2 = kayakDocTop - centerY;
        const scrollRange2 = Math.max(winH * 0.6, targetScroll2 - galleryBottom);
        const progress2 = Math.min(Math.max((scrollY - galleryBottom) / scrollRange2, 0), 1);

        if (progress2 < 1) {
          shouldShowPaddle = true;
          currentX = centerX + (contactX - centerX) * progress2;
          currentY = centerY + (contactY - centerY) * progress2;
          currentRotation = 90 + (progress2 * 90);
        } else {
          // Settled in kayak man's hands
          currentX = contactX;
          currentY = contactY;
          currentRotation = 180;

          // Check if user has scrolled past comparison section
          const compSection = document.querySelector('.comparison-section');
          if (compSection) {
            const compRect = compSection.getBoundingClientRect();
            shouldShowPaddle = compRect.bottom > 60;
          } else {
            shouldShowPaddle = contactRect.top > -winH;
          }
        }
      }

      paddleWrapper.style.opacity = shouldShowPaddle ? '1' : '0';
      paddleWrapper.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) rotate(${currentRotation}deg)`;

      if (isInGalleryZone) {
        if (quoteContainer) quoteContainer.classList.add('quote-visible');
        if (mainHeader) mainHeader.classList.add('dark-mode');
        paddleWrapper.classList.add('paddle-in-black');
      } else {
        if (quoteContainer) quoteContainer.classList.remove('quote-visible');
        if (mainHeader) mainHeader.classList.remove('dark-mode');
        paddleWrapper.classList.remove('paddle-in-black');
      }

      // 3D Tilt calculation
      if (isInGalleryZone) {
        let targetTiltX = -cursorNormY * 18;
        let targetTiltY = cursorNormX * 18;

        if (hasGyroscope) {
          targetTiltX = -deviceTiltX * 0.7;
          targetTiltY = deviceTiltY * 0.7;
        }

        tiltX += (targetTiltX - tiltX) * 0.08;
        tiltY += (targetTiltY - tiltY) * 0.08;
      } else {
        tiltX += (0 - tiltX) * 0.1;
        tiltY += (0 - tiltY) * 0.1;
      }

      if (paddleInner) paddleInner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      if (quoteInner) quoteInner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      // Continuous 3D Gallery Rotation + Gyro Look
      if (!isModalOpen) {
        if (!isDragging) {
          targetDragRotY += autoSpin;
        }

        let dynamicLookX = 0;
        let dynamicLookY = 0;

        if (isInGalleryZone) {
          if (hasGyroscope) {
            dynamicLookX = -deviceTiltX;
            dynamicLookY = deviceTiltY * 1.5;
          } else {
            if (Math.abs(cursorNormX) > 0.45) {
              targetDragRotY += cursorNormX * 0.16;
            }
            dynamicLookX = -cursorNormY * 24;
            dynamicLookY = cursorNormX * 12;
          }
        }

        const targetTotalX = Math.max(-42, Math.min(42, targetDragRotX + dynamicLookX));
        const targetTotalY = targetDragRotY + dynamicLookY;

        rotX += (targetTotalX - rotX) * 0.06;
        rotY += (targetTotalY - rotY) * 0.06;
        arena.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      requestAnimationFrame(renderGalleryAnimation);
    }

    // Mouse Interaction
    window.addEventListener('mousemove', (e) => {
      cursorNormX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      cursorNormY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        targetDragRotY += deltaX * 0.22;
        targetDragRotX -= deltaY * 0.18;
        targetDragRotX = Math.max(-38, Math.min(38, targetDragRotX));

        startX = e.clientX;
        startY = e.clientY;
      }
    });

    viewport.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    document.addEventListener('mouseleave', () => {
      cursorNormX = 0;
      cursorNormY = 0;
    });

    // Touch Swipe Spin
    let touchStartX = 0;
    let touchStartY = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        targetDragRotY += deltaX * 0.15;
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildGallery();
      }, 150);
    });

    buildGallery();
    requestAnimationFrame(renderGalleryAnimation);
  }

  /* ==========================================================================
     RIPPLEBAY WAVE & 3D SPIRAL GALLERY ANIMATION ENGINE
     Adapted from RIPPLEBAY GALLERY ANIMATION/waveRipplebay.html
     ========================================================================== */
  const rbGalleryWrapper = document.querySelector('.ripplebay-gallery-wrapper');
  const spiralArena = document.getElementById('spiralArena');
  const waveCanvas = document.getElementById('waveCanvas');

  if (rbGalleryWrapper && spiralArena && waveCanvas) {
    const boatTop = document.getElementById('boatTop');
    const boat3D = document.getElementById('boat3D');
    const boatInner = document.getElementById('boatInner');
    const boatQuote = document.getElementById('boatQuote');
    const quoteInner = document.getElementById('quoteInner');
    const rbIntroScreen = document.getElementById('rbIntroScreen');

    const dragHint = document.getElementById('dragHint');
    const blackOverlay = document.getElementById('blackOverlay');
    const spiralViewport = document.getElementById('spiralViewport');

    const marqueeViewport = document.getElementById('marqueeViewport');
    const strip1 = document.getElementById('strip1');
    const strip2 = document.getElementById('strip2');

    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    const ctx = waveCanvas.getContext('2d');
    const topCanvas = document.getElementById('topWaveCanvas');
    const topCtx = topCanvas ? topCanvas.getContext('2d') : null;

    let winW, winH, isMobile;
    function resizeRb() {
      winW = waveCanvas.width = window.innerWidth;
      winH = waveCanvas.height = window.innerHeight;
      if (topCanvas) {
        topCanvas.width = winW;
        topCanvas.height = 180;
      }
      isMobile = winW < 900;
    }
    window.addEventListener('resize', resizeRb);
    resizeRb();

    const rbWaterImages = [
      'image/ripplebay.jpg',
      'image/ripplebayBoatCruise1.jpg',
      'image/ripplebayBoatCruise2.jpg',
      'image/ripplebayBoatCruise3.jpg',
      'image/ripplebayBuggyService1.jpg',
      'image/ripplebayBuggyService2.jpg',
      'image/ripplebayBuggyService3.jpg',
      'image/gallery2.jpg',
      'image/hero.jpg',
      'image/watersportsAreaRipplebay.jpg',
      'image/gallery1.jpg',
      'image/gallery3.jpg',
      'image/gallery4.jpg',
      'image/titiwangsa.jpg',
      'image/crystalDome1.jpg',
      'image/crystalDome2.jpg',
      'image/nightViewTitiwangsa1.jpg',
      'image/nightViewTitiwangsa2.jpg'
    ];

    let isRbModalOpen = false;
    const cardElements = [];

    rbWaterImages.forEach((src) => {
      const card = document.createElement('div');
      card.className = 'spiral-card';
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = 'Ripplebay Watersports';
      img.draggable = false;
      card.appendChild(img);
      spiralArena.appendChild(card);
      cardElements.push(card);

      let clickStartX = 0;
      let clickStartY = 0;

      card.addEventListener('mousedown', (e) => {
        clickStartX = e.clientX;
        clickStartY = e.clientY;
      });

      card.addEventListener('click', (e) => {
        const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
        if (dist > 8) return;
        e.stopPropagation();
        if (lightboxModal && lightboxImg) {
          lightboxImg.src = src;
          lightboxModal.classList.add('active');
          isRbModalOpen = true;
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        if (lightboxModal) lightboxModal.classList.remove('active');
        isRbModalOpen = false;
      });
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.remove('active');
          isRbModalOpen = false;
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isRbModalOpen && lightboxModal) {
        lightboxModal.classList.remove('active');
        isRbModalOpen = false;
      }
    });

    // Spiral Spin & 3D Tilt Engine
    let spiralSpinOffset = 0;
    let targetSpiralSpin = 0;
    let rotX = 0;
    let targetDragRotX = 0;
    let cursorNormX = 0;
    let cursorNormY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    let deviceTiltX = 0;
    let deviceTiltY = 0;
    let hasGyroscope = false;

    function handleRbOrientation(e) {
      if (e.beta === null || e.gamma === null) return;
      hasGyroscope = true;
      const pitch = (e.beta - 45);
      const roll = e.gamma;
      deviceTiltX = Math.max(-28, Math.min(28, pitch * 0.7));
      deviceTiltY = Math.max(-35, Math.min(35, roll * 0.8));
    }

    function requestRbMotionPermission() {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleRbOrientation);
            }
          })
          .catch(() => {});
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleRbOrientation);
      }
    }
    window.addEventListener('touchstart', requestRbMotionPermission, { once: true });

    window.addEventListener('mousemove', (e) => {
      cursorNormX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      cursorNormY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      if (isDragging && !isRbModalOpen) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        targetSpiralSpin += deltaX * 0.0055;
        targetDragRotX -= deltaY * 0.18;
        targetDragRotX = Math.max(-38, Math.min(38, targetDragRotX));

        startX = e.clientX;
        startY = e.clientY;
      }
    });

    if (spiralViewport) {
      spiralViewport.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
      });

      spiralViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          isDragging = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        }
      }, { passive: true });

      spiralViewport.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length === 0 || isRbModalOpen) return;
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        targetSpiralSpin += deltaX * 0.0065;
        targetDragRotX -= deltaY * 0.18;
        targetDragRotX = Math.max(-38, Math.min(38, targetDragRotX));

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      spiralViewport.addEventListener('touchend', () => { isDragging = false; });
    }

    window.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('mouseleave', () => {
      cursorNormX = 0;
      cursorNormY = 0;
      isDragging = false;
    });

    function lerpVal(start, end, factor) {
      return start + (end - start) * factor;
    }

    function getSnakePosition(p) {
      const x = lerpVal(winW * 1.05, -winW * 0.12, p);
      const centerY = winH * 0.50;

      const waveCycles = isMobile ? 3.2 : 4.4;
      const waveAmp = isMobile ? winH * 0.095 : winH * 0.13;

      const waveFreq = p * Math.PI * waveCycles;
      const y = centerY + Math.sin(waveFreq) * waveAmp;

      const dx = -winW * 1.17;
      const dy = Math.cos(waveFreq) * (Math.PI * waveCycles) * waveAmp;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      return { x, y, angle, nx, ny };
    }

    function drawSmoothSpline(pts, context) {
      if (pts.length < 2) return;
      context.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        context.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      context.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }

    function renderTopWavingWave(time) {
      if (!topCtx) return;
      topCtx.clearRect(0, 0, winW, 180);

      const waves = [
        { yBase: 55, amp: 12, freq: 0.0035, speed: 1.2, color: 'rgba(255, 94, 0, 0.85)', width: 3 },
        { yBase: 68, amp: 16, freq: 0.0024, speed: -0.8, color: 'rgba(255, 255, 255, 0.75)', width: 2 },
        { yBase: 80, amp: 10, freq: 0.0042, speed: 1.5, color: 'rgba(148, 163, 184, 0.45)', width: 1.5 }
      ];

      waves.forEach(w => {
        topCtx.beginPath();
        for (let x = 0; x <= winW; x += 10) {
          const y = w.yBase + Math.sin(x * w.freq + time * w.speed) * w.amp;
          if (x === 0) topCtx.moveTo(x, y);
          else topCtx.lineTo(x, y);
        }
        topCtx.strokeStyle = w.color;
        topCtx.lineWidth = w.width;
        topCtx.lineCap = 'round';
        topCtx.stroke();
      });
    }

    function updateSpiralGallery(progress, time) {
      if (!spiralViewport) return;
      if (progress < 0.48) {
        spiralViewport.style.opacity = '0';
        spiralViewport.style.pointerEvents = 'none';
        if (dragHint) dragHint.style.opacity = '0';
        return;
      }

      const overallOpacity = Math.min((progress - 0.48) / 0.10, 1);
      spiralViewport.style.opacity = `${overallOpacity}`;
      spiralViewport.style.pointerEvents = overallOpacity > 0.5 ? 'auto' : 'none';
      if (dragHint) dragHint.style.opacity = `${overallOpacity * 0.85}`;

      if (!isDragging) {
        targetSpiralSpin += 0.0032;
      }

      spiralSpinOffset = lerpVal(spiralSpinOffset, targetSpiralSpin, 0.08);

      let dynamicLookX = 0;
      if (hasGyroscope) {
        dynamicLookX = -deviceTiltX * 0.6;
      } else {
        dynamicLookX = -cursorNormY * 16;
      }

      const targetTotalX = Math.max(-38, Math.min(38, targetDragRotX + dynamicLookX));
      rotX += (targetTotalX - rotX) * 0.06;

      spiralArena.style.transform = `rotateX(${rotX}deg)`;

      const minRadius = isMobile ? Math.min(winW, winH) * 0.18 : Math.min(winW, winH) * 0.20;
      const maxRadius = isMobile ? Math.max(winW, winH) * 0.48 : Math.max(winW, winH) * 0.54;
      const totalCards = cardElements.length;

      cardElements.forEach((card, idx) => {
        const t = idx / (totalCards - 1);
        const r = lerpVal(minRadius, maxRadius, Math.pow(t, 1.05));
        const angle = t * (Math.PI * 3.1) + spiralSpinOffset;

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = lerpVal(-120, 80, t);

        const scale = isMobile ? lerpVal(0.42, 0.95, t) : lerpVal(0.38, 1.10, t);
        const rotationDeg = (angle * 180 / Math.PI) + 90 + (t * 12);
        const cardAlpha = lerpVal(0.4, 1.0, Math.pow(t, 0.6));

        card.style.opacity = `${cardAlpha}`;
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%) rotate(${rotationDeg}deg) scale(${scale})`;
      });
    }

    function renderRipplebayAnimation() {
      const rect = rbGalleryWrapper.getBoundingClientRect();
      const galleryScrollDist = Math.max(1, rbGalleryWrapper.offsetHeight - window.innerHeight);
      const scrolledIntoGallery = -rect.top;
      const progress = Math.min(Math.max(scrolledIntoGallery / galleryScrollDist, 0), 1);
      const time = performance.now() * 0.004;

      const isInsideRunway = rect.top <= 0 && rect.bottom >= window.innerHeight;
      const isPartiallyVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      if (!isPartiallyVisible && !isInsideRunway) {
        requestAnimationFrame(renderRipplebayAnimation);
        return;
      }

      // 1. Intro Screen
      if (rbIntroScreen) {
        if (progress < 0.08) {
          rbIntroScreen.style.opacity = `${1 - progress / 0.08}`;
          rbIntroScreen.style.pointerEvents = 'none';
        } else {
          rbIntroScreen.style.opacity = '0';
        }
      }

      // 2. Kinetic Marquee Runway
      if (marqueeViewport && strip1 && strip2) {
        if (progress > 0.06 && progress < 0.48) {
          marqueeViewport.style.opacity = '1';
          strip1.style.transform = `translateX(${-scrolledIntoGallery * 0.45}px)`;
          strip2.style.transform = `translateX(${scrolledIntoGallery * 0.35}px)`;
        } else {
          marqueeViewport.style.opacity = '0';
        }
      }

      ctx.clearRect(0, 0, winW, winH);

      // 3. boatTop Movement & Smooth Curved Text Wake
      if (boatTop) {
        if (progress > 0.08 && progress <= 0.52) {
          boatTop.style.opacity = '1';

          const p = Math.min(Math.max((progress - 0.08) / 0.42, 0), 1);
          const currentPos = getSnakePosition(p);

          boatTop.style.transform = `translate3d(${currentPos.x}px, ${currentPos.y}px, 0px) translate(-50%, -50%) rotate(${currentPos.angle}deg)`;

          const steps = 140;
          const currentStep = Math.floor(steps * p);

          ctx.save();
          const baseHalfWidth = isMobile ? 22 : Math.min(30, winW * 0.026);

          const centerPts = [];
          const leftEdgePts = [];
          const rightEdgePts = [];
          const leftOuterPts = [];
          const rightOuterPts = [];

          for (let i = 0; i <= currentStep; i++) {
            const stepP = i / steps;
            const pt = getSnakePosition(stepP);
            const distanceBehind = (p - stepP);
            
            const maxExpand = isMobile ? 28 : 42;
            const wakeExpansion = Math.min(distanceBehind * 50, maxExpand);
            const waveOscLeft = Math.sin(stepP * 20 - time) * (isMobile ? 2.5 : 4.0);
            const waveOscRight = Math.cos(stepP * 20 - time) * (isMobile ? 2.5 : 4.0);

            const offsetInnerLeft = baseHalfWidth + wakeExpansion + waveOscLeft;
            const offsetInnerRight = baseHalfWidth + wakeExpansion + waveOscRight;

            const offsetOuterLeft = offsetInnerLeft + (isMobile ? 18 : 24);
            const offsetOuterRight = offsetInnerRight + (isMobile ? 18 : 24);

            centerPts.push(pt);
            leftEdgePts.push({ x: pt.x + pt.nx * offsetInnerLeft, y: pt.y + pt.ny * offsetInnerLeft });
            rightEdgePts.push({ x: pt.x - pt.nx * offsetInnerRight, y: pt.y - pt.ny * offsetInnerRight });
            leftOuterPts.push({ x: pt.x + pt.nx * offsetOuterLeft, y: pt.y + pt.ny * offsetOuterLeft });
            rightOuterPts.push({ x: pt.x - pt.nx * offsetOuterRight, y: pt.y - pt.ny * offsetOuterRight });
          }

          if (currentStep > 2) {
            ctx.beginPath();
            drawSmoothSpline(leftEdgePts, ctx);
            for (let i = rightEdgePts.length - 1; i >= 0; i--) {
              ctx.lineTo(rightEdgePts[i].x, rightEdgePts[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = '#000000';
            ctx.fill();

            // Center spine
            ctx.beginPath();
            drawSmoothSpline(centerPts, ctx);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = baseHalfWidth * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Looping text along curve
            const dists = [0];
            let totalLen = 0;
            for (let i = 1; i <= currentStep; i++) {
              const d = Math.hypot(centerPts[i].x - centerPts[i - 1].x, centerPts[i].y - centerPts[i - 1].y);
              totalLen += d;
              dists.push(totalLen);
            }

            function getPointOnTrail(s) {
              if (s <= 0) return centerPts[0];
              if (s >= totalLen) return centerPts[currentStep];
              let idx = 1;
              while (idx < dists.length && dists[idx] < s) idx++;
              const prevDist = dists[idx - 1];
              const nextDist = dists[idx];
              const frac = (nextDist === prevDist) ? 0 : (s - prevDist) / (nextDist - prevDist);
              const p0 = centerPts[idx - 1];
              const p1 = centerPts[idx];
              return {
                x: lerpVal(p0.x, p1.x, frac),
                y: lerpVal(p0.y, p1.y, frac)
              };
            }

            const loopPhrase = "RIPPLEBAY  |  TAMAN BOTANI PERDANA  |  KUALA LUMPUR  |  ";
            ctx.font = isMobile ? "800 11px 'Plus Jakarta Sans', sans-serif" : "800 12.5px 'Plus Jakarta Sans', sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            const boatClearance = isMobile ? 55 : Math.min(80, winW * 0.08);

            if (totalLen > boatClearance + 20) {
              let cursorDist = totalLen - boatClearance;
              let charIndex = 0;

              while (cursorDist > 18) {
                const char = loopPhrase[charIndex % loopPhrase.length];
                const charWidth = ctx.measureText(char).width;
                const stepDist = Math.max(charWidth + (isMobile ? 2.8 : 3.5), 8);

                const currentP = getPointOnTrail(cursorDist);
                const nextP = getPointOnTrail(cursorDist - 3);

                const dx = nextP.x - currentP.x;
                const dy = nextP.y - currentP.y;
                const angle = Math.atan2(dy, dx);

                ctx.save();
                ctx.translate(currentP.x, currentP.y);
                ctx.rotate(angle);
                ctx.fillText(char, 0, 0);
                ctx.restore();

                cursorDist -= stepDist;
                charIndex++;
              }
            }
          }

          if (currentStep > 2) {
            ctx.beginPath();
            drawSmoothSpline(leftEdgePts, ctx);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.lineWidth = isMobile ? 3 : 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            drawSmoothSpline(rightEdgePts, ctx);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.lineWidth = isMobile ? 3 : 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            drawSmoothSpline(leftOuterPts, ctx);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            drawSmoothSpline(rightOuterPts, ctx);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          ctx.restore();
        } else {
          boatTop.style.opacity = '0';
        }
      }

      // 4. Black Section: 3D Spiral & Boat Tilt
      if (progress >= 0.48 && isInsideRunway) {
        const darkProgress = Math.min((progress - 0.48) / 0.08, 1);
        if (blackOverlay) blackOverlay.style.opacity = `${darkProgress}`;

        if (topCanvas) {
          topCanvas.style.opacity = `${darkProgress}`;
          renderTopWavingWave(time);
        }

        if (mainHeader) {
          if (darkProgress > 0.4) {
            mainHeader.classList.add('dark-mode');
          } else {
            mainHeader.classList.remove('dark-mode');
          }
        }

        updateSpiralGallery(progress, time);

        if (boat3D) {
          const popProgress = Math.min((progress - 0.48) / 0.10, 1);
          const boatScale = lerpVal(0.3, 1, Math.sin((popProgress * Math.PI) / 2));
          const boatBob = Math.sin(time * 0.8) * 5;

          boat3D.style.opacity = `${popProgress}`;
          boat3D.style.transform = `translate(-50%, calc(-50% + ${boatBob}px)) scale(${boatScale})`;
        }

        if (boatQuote) {
          const quoteProgress = Math.min(Math.max((progress - 0.52) / 0.10, 0), 1);
          boatQuote.style.opacity = `${quoteProgress}`;
          if (winW > 900) {
            boatQuote.style.transform = `translateY(-50%) translateX(${lerpVal(25, 0, quoteProgress)}px)`;
          } else {
            boatQuote.style.transform = `translate(-50%, -50%) translateY(${lerpVal(18, 0, quoteProgress)}px)`;
          }
        }

        let targetTiltX = -cursorNormY * 18;
        let targetTiltY = cursorNormX * 18;

        if (hasGyroscope) {
          targetTiltX = -deviceTiltX * 0.7;
          targetTiltY = deviceTiltY * 0.7;
        }

        tiltX += (targetTiltX - tiltX) * 0.08;
        tiltY += (targetTiltY - tiltY) * 0.08;

        if (boatInner) boatInner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        if (quoteInner) quoteInner.style.transform = `rotateX(${tiltX * 0.75}deg) rotateY(${tiltY * 0.75}deg)`;

      } else {
        if (blackOverlay) blackOverlay.style.opacity = '0';
        if (topCanvas) topCanvas.style.opacity = '0';
        if (spiralViewport) spiralViewport.style.opacity = '0';
        if (dragHint) dragHint.style.opacity = '0';

        if (boat3D) {
          boat3D.style.opacity = '0';
          boat3D.style.transform = 'translate(-50%, -50%) scale(0)';
        }
        if (boatQuote) boatQuote.style.opacity = '0';

        tiltX = 0;
        tiltY = 0;
        if (boatInner) boatInner.style.transform = 'none';
        if (quoteInner) quoteInner.style.transform = 'none';

        if (mainHeader && !document.querySelector('.gallery-wrapper')) {
          mainHeader.classList.remove('dark-mode');
        }
      }

      requestAnimationFrame(renderRipplebayAnimation);
    }

    requestAnimationFrame(renderRipplebayAnimation);
  }

  /* ==========================================================
     TITIWANGSA 3D CRYSTAL DOME & SPIRAL GALLERY ANIMATION
     ========================================================== */
  const ttwContainer = document.getElementById('ttw-webgl-viewport');
  const ttwWrapper = document.querySelector('.titiwangsa-gallery-wrapper');

  if (ttwContainer && ttwWrapper && typeof THREE !== 'undefined') {
    const initialIsMobile = window.innerWidth <= 768;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 10, 5000);
    const targetZ = initialIsMobile ? 1400 : 1150;
    camera.position.set(0, 0, targetZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    ttwContainer.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'pan-y';

    // Orbit Controls: Only enabled on desktop non-touch screens for horizontal mouse dragging.
    // On mobile & touch screens, OrbitControls is completely bypassed to prevent OrbitControls.js (lines 884 & 948)
    // from calling event.preventDefault() and blocking native vertical page scroll.
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768) || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let controls;
    if (isTouchDevice) {
      controls = {
        update: function() {},
        enabled: false,
        dispose: function() {},
        minDistance: targetZ,
        maxDistance: targetZ
      };
    } else {
      // On desktop: enable OrbitControls for mouse orbiting, but filter out touch listeners
      const origAddEvent = renderer.domElement.addEventListener;
      renderer.domElement.addEventListener = function(type, listener, options) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
          return; // Ignore touch listeners so touch gestures never get trapped
        }
        return origAddEvent.call(this, type, listener, options);
      };

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      renderer.domElement.addEventListener = origAddEvent; // Restore original

      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = false;
      controls.minDistance = targetZ;
      controls.maxDistance = targetZ;
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(250, 500, 400);
    scene.add(keyLight);

    // Floor & Words Clipping Planes
    const floorClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 220);
    const wordsClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // --- Centerpiece: Crystal Dome ---
    const domeGroup = new THREE.Group();
    scene.add(domeGroup);

    const domeStartHeight = initialIsMobile ? 60 : 80;
    const domeTargetLowestHeight = initialIsMobile ? -90 : -110;
    domeGroup.position.y = domeStartHeight;

    // Soft Shadow Canvas Texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
    sGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.06)');
    sGrad.addColorStop(1, 'transparent');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(380, 380),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -140;
    domeGroup.add(floorShadow);

    const domeGeo = new THREE.PlaneGeometry(340, 300);
    const domeMat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      fog: false,
      toneMapped: false,
      depthTest: true
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.set(0, 10, 0);
    domeMesh.renderOrder = 5;
    domeGroup.add(domeMesh);

    // Direct Image Pipeline for Crystal Dome
    const domeImgElement = new Image();
    domeImgElement.crossOrigin = 'anonymous';
    domeImgElement.src = 'image/crystalDome.png';
    domeImgElement.onload = function() {
      const tex = new THREE.Texture(domeImgElement);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      domeMat.map = tex;
      domeMat.needsUpdate = true;
    };

    // --- Kinetic Words Stack ---
    const wordsGroup = new THREE.Group();
    scene.add(wordsGroup);
    wordsGroup.position.set(0, domeStartHeight, -35);

    const wordsData = [
      { text: 'LETS', color: '#969696', targetY: 420 },
      { text: 'MAKE', color: '#16A300', targetY: 330 },
      { text: 'MEMORIES', color: '#969696', targetY: 240 },
      { text: 'TOGETHER', color: '#16A300', targetY: 150 }
    ];

    const wordMeshObjects = [];

    function makeCustomTextTexture(text, color) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      const fontSize = 110;
      ctx.font = `900 ${fontSize}px "Syne", "Plus Jakarta Sans", sans-serif`;

      const metrics = ctx.measureText(text);
      const padding = 120;
      const w = Math.ceil(metrics.width + padding);
      const h = 200;

      c.width = w;
      c.height = h;

      ctx.font = `900 ${fontSize}px "Syne", "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(text, w / 2, h / 2);

      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const planeWidth = (w / h) * 75;
      return { texture: tex, width: planeWidth, height: 75 };
    }

    wordsData.forEach((item) => {
      const { texture, width, height } = makeCustomTextTexture(item.text, item.color);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        clippingPlanes: [wordsClipPlane]
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
      mesh.position.set(0, 0, 0);
      mesh.renderOrder = 1;

      wordsGroup.add(mesh);
      wordMeshObjects.push({
        mesh: mesh,
        targetY: item.targetY
      });
    });

    // --- 3D Spiral Helix Gallery ---
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    helixGroup.position.y = -1600;

    const galleryPhotos = [
      { url: 'image/crystalDome1.jpg', title: 'Crystal Dome VIP Lounge' },
      { url: 'image/crystalDome2.jpg', title: 'Lakeside Glamping Pods' },
      { url: 'image/crystalDome3.jpg', title: 'Waterfront Sunset Experience' },
      { url: 'image/nightViewTitiwangsa1.jpg', title: 'Titiwangsa Night City Lights' },
      { url: 'image/nightViewTitiwangsa2.jpg', title: 'KL Skyline Lake Reflection' },
      { url: 'image/nightViewTitiwangsa3.jpg', title: 'Evening Glow Waterfront' },
      { url: 'image/gallery1.jpg', title: 'Kayak Challenge Action' },
      { url: 'image/gallery2.jpg', title: 'Twin Kayak Lake Voyage' },
      { url: 'image/gallery3.jpg', title: 'Pelican & Swan Fleet' },
      { url: 'image/gallery4.jpg', title: 'Water Tricycle Family Fun' },
      { url: 'image/tb1.jpg', title: 'Corporate Water Challenge' },
      { url: 'image/tb2.jpg', title: 'Team Tug-O-War on Water' },
      { url: 'image/tb3.jpg', title: 'Paddle Sprint Competition' },
      { url: 'image/tb4.jpg', title: 'Lake Rescue & Confidence' },
      { url: 'image/titiwangsa.jpg', title: 'Aquasports Pier at Tasik Titiwangsa' },
      { url: 'image/titiwangsaPanorama.jpg', title: 'Panoramic Tasik Titiwangsa' }
    ];

    const cardWidth = initialIsMobile ? 74 : 86;
    const cardHeight = initialIsMobile ? 66 : 76;
    const totalCards = 72;
    const radius = initialIsMobile ? 320 : 370;
    const verticalSpan = 1200;
    const rotations = 3.2;

    const frameGeo = new THREE.BoxGeometry(cardWidth, cardHeight, 3);
    const photoGeo = new THREE.PlaneGeometry(cardWidth - 8, cardHeight - 8);
    const outlineGeo = new THREE.PlaneGeometry(cardWidth + 4, cardHeight + 4);

    const interactiveCardMeshes = [];
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures = galleryPhotos.map(p => textureLoader.load(p.url));

    for (let i = 0; i < totalCards; i++) {
      const progress = i / totalCards;
      const angle = progress * (Math.PI * 2 * rotations);
      const y = (progress - 0.2) * verticalSpan;

      const card = new THREE.Group();

      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.2,
        clippingPlanes: [floorClipPlane],
        clipShadows: true
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      card.add(frameMesh);

      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x16a300,
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
        clippingPlanes: [floorClipPlane]
      });
      const glowMesh = new THREE.Mesh(outlineGeo, glowMat);
      glowMesh.position.z = -1.6;
      card.add(glowMesh);

      const photoIdx = i % galleryPhotos.length;
      const photoData = galleryPhotos[photoIdx];
      const photoTex = loadedTextures[photoIdx];

      const photoMat = new THREE.MeshBasicMaterial({
        map: photoTex,
        clippingPlanes: [floorClipPlane]
      });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 1.6;
      card.add(photoMesh);

      card.userData = {
        isInteractive: true,
        photoUrl: photoData.url,
        photoTitle: photoData.title,
        glowMesh: glowMesh,
        initialScale: 1.0,
        currentScale: 1.0
      };
      interactiveCardMeshes.push(frameMesh);
      frameMesh.userData.parentCard = card;
      interactiveCardMeshes.push(photoMesh);
      photoMesh.userData.parentCard = card;

      card.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      card.lookAt(0, y, 0);
      card.rotation.y += Math.PI;

      helixGroup.add(card);
    }

    // --- Lightbox Modal ---
    const ttwLightboxModal = document.getElementById('ttwLightboxModal');
    const ttwLightboxImg = document.getElementById('ttwLightboxImg');
    const ttwLightboxTitle = document.getElementById('ttwLightboxTitle');
    const ttwLightboxClose = document.getElementById('ttwLightboxClose');
    const ttwLightboxContent = ttwLightboxModal ? ttwLightboxModal.querySelector('.ttw-lightbox-content') : null;

    let isLightboxOpen = false;
    let hoveredCard = null;

    function openLightbox(card) {
      if (!card || !card.userData || !card.userData.photoUrl || !ttwLightboxModal) return;
      isLightboxOpen = true;
      ttwLightboxImg.src = card.userData.photoUrl;
      ttwLightboxTitle.innerText = card.userData.photoTitle || 'Aquasports Gallery';
      ttwLightboxModal.classList.add('active');

      if (hoveredCard) {
        resetCardHover(hoveredCard);
        hoveredCard = null;
      }
      mouse.set(-100, -100);
      document.body.style.cursor = 'default';
      controls.enabled = false;
    }

    function closeLightbox() {
      if (!isLightboxOpen || !ttwLightboxModal) return;
      isLightboxOpen = false;
      ttwLightboxModal.classList.remove('active');

      if (hoveredCard) {
        resetCardHover(hoveredCard);
        hoveredCard = null;
      }
      mouse.set(-100, -100);
      document.body.style.cursor = 'default';
      if (!isTouchDevice) {
        controls.enabled = true;
      }
    }

    if (ttwLightboxClose) {
      const handleClose = (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeLightbox();
      };
      ttwLightboxClose.addEventListener('click', handleClose);
      ttwLightboxClose.addEventListener('touchend', handleClose);
    }

    if (ttwLightboxModal) {
      const handleModalClose = (e) => {
        if (e.target === ttwLightboxModal) {
          e.stopPropagation();
          closeLightbox();
        }
      };
      ttwLightboxModal.addEventListener('click', handleModalClose);
      ttwLightboxModal.addEventListener('touchend', handleModalClose);
    }

    if (ttwLightboxContent) {
      const stopProp = (e) => e.stopPropagation();
      ttwLightboxContent.addEventListener('click', stopProp);
      ttwLightboxContent.addEventListener('touchend', stopProp);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    });

    // --- Raycasting & Click / Tap Interactions ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    window.addEventListener('mousemove', (e) => {
      if (isLightboxOpen) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function checkRaycastHit(clientX, clientY) {
      const clickMouse = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);
      const intersects = raycaster.intersectObjects(interactiveCardMeshes);
      const validIntersect = intersects.find(hit => hit.point.y >= -220);

      if (validIntersect) {
        const clickedCard = validIntersect.object.userData.parentCard;
        if (clickedCard) {
          openLightbox(clickedCard);
          return true;
        }
      }
      return false;
    }

    window.addEventListener('click', (e) => {
      if (isLightboxOpen) return;
      if (e.target.closest('#ttwLightboxModal')) return;
      if (!e.target.closest('#ttw-webgl-viewport')) return;
      checkRaycastHit(e.clientX, e.clientY);
    });

    // Touch Tap Detection for Mobile (Distinguish tap from vertical scroll swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    renderer.domElement.addEventListener('touchstart', (e) => {
      if (isLightboxOpen) return;
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    renderer.domElement.addEventListener('touchend', (e) => {
      if (isLightboxOpen) return;
      const timeDiff = Date.now() - touchStartTime;
      if (timeDiff > 350) return; // User was dragging / scrolling, not tapping

      const touch = e.changedTouches[0];
      if (!touch) return;
      const distX = Math.abs(touch.clientX - touchStartX);
      const distY = Math.abs(touch.clientY - touchStartY);
      if (distX > 14 || distY > 14) return; // Swiped to scroll, ignore tap

      // Clean tap on mobile!
      checkRaycastHit(touch.clientX, touch.clientY);
    }, { passive: true });

    // --- Scroll Timeline ---
    let scrollProgress = 0;
    const heroSection = document.getElementById('ttwHeroSection');
    const scrollHint = document.getElementById('ttwScrollHint');

    function updateTtwScroll() {
      const rect = ttwWrapper.getBoundingClientRect();
      const maxScroll = ttwWrapper.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      scrollProgress = Math.min(Math.max(-rect.top / maxScroll, 0), 1);

      const fadeThreshold = 0.22;
      if (scrollProgress < fadeThreshold) {
        const factor = 1 - (scrollProgress / fadeThreshold);
        if (heroSection) {
          heroSection.style.opacity = factor;
          heroSection.style.transform = `translateY(${-scrollProgress * 150}px)`;
        }
        if (scrollHint) scrollHint.style.opacity = factor;
      } else {
        if (heroSection) heroSection.style.opacity = 0;
        if (scrollHint) scrollHint.style.opacity = 0;
      }
    }

    window.addEventListener('scroll', updateTtwScroll, { passive: true });
    updateTtwScroll();

    // --- Tilt Handler (Mouse & Device Orientation) ---
    let targetTiltX = 0;
    let targetTiltY = 0;

    window.addEventListener('mousemove', (e) => {
      const mX = (e.clientX / window.innerWidth) * 2 - 1;
      const mY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetTiltX = -mY * 0.14;
      targetTiltY = mX * 0.18;
    });

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        if (event.beta === null || event.gamma === null) return;
        const normBeta = THREE.MathUtils.clamp((event.beta - 45) / 45, -1, 1);
        const normGamma = THREE.MathUtils.clamp(event.gamma / 45, -1, 1);
        targetTiltX = normBeta * 0.18;
        targetTiltY = normGamma * 0.22;
      });
    }

    // --- Main Animation Loop ---
    let currentHelixY = -1600;

    function resetCardHover(card) {
      if (!card) return;
      card.scale.set(1, 1, 1);
      card.userData.currentScale = 1.0;
      if (card.userData.glowMesh) {
        card.userData.glowMesh.material.opacity = 0;
      }
    }

    function animateTtwGallery() {
      requestAnimationFrame(animateTtwGallery);

      // Only perform heavy rendering when gallery wrapper is visible in or near viewport
      const rect = ttwWrapper.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        return;
      }

      // 1. Dome descends down on scroll (0 -> 0.35)
      const domeProgress = Math.min(scrollProgress / 0.35, 1.0);
      const targetDomeY = THREE.MathUtils.lerp(domeStartHeight, domeTargetLowestHeight, domeProgress);
      domeGroup.position.y += (targetDomeY - domeGroup.position.y) * 0.08;

      wordsGroup.position.y = domeGroup.position.y;
      const domeRoofWorldY = domeGroup.position.y + 130;
      wordsClipPlane.constant = -domeRoofWorldY;

      // 2. Spiral & Words unfold
      let targetHelixY = -1600;
      let wordsUnfoldProgress = 0;

      if (scrollProgress > 0.28) {
        const spiralProgress = (scrollProgress - 0.28) / (1.0 - 0.28);
        targetHelixY = THREE.MathUtils.lerp(-1300, -100, spiralProgress);
        wordsUnfoldProgress = Math.min(Math.max((spiralProgress - 0.20) / 0.75, 0), 1);
      }
      currentHelixY += (targetHelixY - currentHelixY) * 0.07;
      helixGroup.position.y = currentHelixY;

      // 3. Staggered reveal for words
      wordMeshObjects.forEach((item, idx) => {
        const wordDelay = idx * 0.18;
        const localProgress = Math.min(Math.max((wordsUnfoldProgress - wordDelay) / (1 - wordDelay), 0), 1);
        const currentY = THREE.MathUtils.lerp(0, item.targetY, localProgress);
        item.mesh.position.y += (currentY - item.mesh.position.y) * 0.1;
        item.mesh.material.opacity = localProgress;
      });

      // 4. Tilt Physics & Auto Rotation
      helixGroup.rotation.x += (targetTiltX * 0.7 - helixGroup.rotation.x) * 0.06;
      helixGroup.rotation.z = 0;

      if (!hoveredCard && !isLightboxOpen) {
        helixGroup.rotation.y += 0.0022;
      }

      domeGroup.quaternion.copy(camera.quaternion);
      domeMesh.rotation.x += (targetTiltX - domeMesh.rotation.x) * 0.06;
      domeMesh.rotation.y += (targetTiltY - domeMesh.rotation.y) * 0.06;

      wordsGroup.quaternion.copy(camera.quaternion);
      wordMeshObjects.forEach(({ mesh }) => {
        mesh.rotation.x += (targetTiltX - mesh.rotation.x) * 0.06;
        mesh.rotation.y += (targetTiltY - mesh.rotation.y) * 0.06;
      });

      // 5. Raycasting for hover & glow
      if (isLightboxOpen) {
        if (hoveredCard) {
          resetCardHover(hoveredCard);
          hoveredCard = null;
        }
        document.body.style.cursor = 'default';
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveCardMeshes);
        const validIntersect = intersects.find(hit => hit.point.y >= -220);

        if (validIntersect) {
          const hitCard = validIntersect.object.userData.parentCard;
          if (hoveredCard !== hitCard) {
            if (hoveredCard) resetCardHover(hoveredCard);
            hoveredCard = hitCard;
            document.body.style.cursor = 'pointer';
          }
        } else {
          if (hoveredCard) {
            resetCardHover(hoveredCard);
            hoveredCard = null;
            document.body.style.cursor = 'default';
          }
        }
      }

      if (hoveredCard && !isLightboxOpen) {
        hoveredCard.userData.currentScale += (1.26 - hoveredCard.userData.currentScale) * 0.15;
        hoveredCard.scale.setScalar(hoveredCard.userData.currentScale);
        if (hoveredCard.userData.glowMesh) {
          hoveredCard.userData.glowMesh.material.opacity += (0.95 - hoveredCard.userData.glowMesh.material.opacity) * 0.15;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animateTtwGallery();

    // --- Resize Handler ---
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        const isMob = window.innerWidth <= 768;
        const newZ = isMob ? 1400 : 1150;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.position.z = newZ;
        controls.minDistance = newZ;
        controls.maxDistance = newZ;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }
});
