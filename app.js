// app.js

// Helper selectors
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Toast utility
const toast = (msg, duration = 2600) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), duration);
};

// PARTICLES BACKGROUND
let particlesInstance = null;
function loadParticles() {
    if (particlesInstance) {
        particlesInstance.destroy();
        particlesInstance = null;
    }
    const theme = document.documentElement.getAttribute('data-theme');
    const linkColor = theme === 'dark' ? '#ffffff' : '#000000';
    tsParticles.load('particles', {
        fpsLimit: 30,
        interactivity: {
            events: { onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 100 } }
        },
        particles: {
            number: { value: 50 },
            size: { value: 3 },
            move: { speed: 0.6 },
            color: { value: '#FAEA93' },
            links: {
                enable: true,
                distance: 120,
                opacity: 0.2,
                color: { value: linkColor }
            }
        }
    }).then(container => {
        particlesInstance = container;
    });
}

// THEME TOGGLE
const themeToggle = $('#themeToggle');
function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('km-theme', t);
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(t === 'dark'));
        themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
    }
}
const storedTheme = localStorage.getItem('km-theme');
setTheme(storedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
loadParticles();
themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    loadParticles();
});

// STICKY HEADER SHADOW
const header = $('.header');
function updateHeaderShadow() {
    header.style.boxShadow = window.scrollY > 6 ? '0 6px 24px rgba(0,0,0,.08)' : 'none';
}
document.addEventListener('scroll', updateHeaderShadow, { passive: true });
updateHeaderShadow();

// MOBILE DRAWER
const burger = $('#burger');
const drawer = $('#drawer');
function toggleDrawer() {
    const open = drawer.classList.toggle('open');
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
}
burger?.addEventListener('click', toggleDrawer);
drawer?.addEventListener('click', e => {
    if (['A', 'BUTTON'].includes(e.target.tagName)) toggleDrawer();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) toggleDrawer();
});

// SMOOTH SCROLL FOR ANCHORS
$$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    });
});

// COPY MEETING LINK
$('#copyLink')?.addEventListener('click', async () => {
    const txt = $('#meetLink')?.textContent.trim();
    if (!txt) return;
    try {
        await navigator.clipboard.writeText(txt);
        toast('Link copied to clipboard');
    } catch {
        toast('Unable to copy. Long-press to copy.');
    }
});

// REVEAL ON SCROLL
const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
        if (ent.isIntersecting) {
            ent.target.classList.add('visible');
            io.unobserve(ent.target);
        }
    });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

// TYPEWRITER EFFECT
const typeEl = $('#typewriter');
if (typeEl) {
    const text = "Effortless hiring with human-friendly interviews";
    let idx = 0;
    function type() {
        if (idx <= text.length) {
            typeEl.textContent = text.slice(0, idx++);
            requestAnimationFrame(type);
        } else {
            typeEl.style.borderRight = 'none';
        }
    }
    type();
}

// MAGNETIC BUTTONS
$$('.btn, .btn-outline, .btn-ghost, .btn-login').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.setProperty('--mx', `${x * 0.2}px`);
        btn.style.setProperty('--my', `${y * 0.2}px`);
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
    });
});

// TESTIMONIALS SLIDER
const slides = $('#slides');
const dots = $$('.dot');
if (slides && dots.length) {
    let idx = 0, auto;
    function setSlide(i) {
        idx = (i + dots.length) % dots.length;
        slides.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, j) => d.classList.toggle('active', j === idx));
    }
    function next() { setSlide(idx + 1); }
    function prev() { setSlide(idx - 1); }
    $('#next')?.addEventListener('click', () => { next(); resetAuto(); });
    $('#prev')?.addEventListener('click', () => { prev(); resetAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { setSlide(+d.dataset.i); resetAuto(); }));
    function startAuto() { auto = setInterval(next, 4500); }
    function stopAuto() { clearInterval(auto); }
    function resetAuto() { stopAuto(); startAuto(); }
    setSlide(0);
    startAuto();
    $('.slider')?.addEventListener('mouseenter', stopAuto);
    $('.slider')?.addEventListener('mouseleave', startAuto);
}

// FAQ ACCORDION
$$('.faq-item').forEach(item => {
    const btn = $('.faq-q', item);
    btn.addEventListener('click', () => {
        const open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
    });
});

// MODAL SETUP
function ensureModal() {
    const m = $('#demoModal');
    return m;
}
const modal = ensureModal();
$$('[data-open="demoModal"]').forEach(btn => {
    btn.addEventListener('click', () => modal.showModal());
});

// FORM VALIDATION & CONFETTI ON DEMO
function makeValidate(form) {
    if (!form) return;
    const fields = $$('[required]', form);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function setInvalid(el, invalid) {
        const fld = el.closest('.field');
        fld && fld.classList.toggle('invalid', invalid);
    }
    function check() {
        let ok = true;
        fields.forEach(el => {
            let valid = !!el.value.trim();
            if (valid && el.type === 'email') valid = emailRe.test(el.value);
            setInvalid(el, !valid);
            ok = ok && valid;
        });
        return ok;
    }
    form.addEventListener('input', e => {
        if (e.target.matches('[required]')) {
            let valid = e.target.value.trim().length > 0;
            if (valid && e.target.type === 'email') valid = emailRe.test(e.target.value);
            setInvalid(e.target, !valid);
        }
    });
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (check()) {
            toast('Thanks! We will reach out soon.');
            if (form.id === 'demoForm' && typeof canvasConfetti === 'function') {
                canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
            form.reset();
            const dlg = form.closest('dialog');
            if (dlg) setTimeout(() => dlg.close(), 400);
        } else {
            toast('Please fix the highlighted fields.');
        }
    });
}
makeValidate($('#contactForm'));
makeValidate($('#demoForm'));

// QUICK ACTIONS
$('#quickSchedule')?.addEventListener('click', () => toast('Scheduling wizard coming soon'));
$('#previewRoom')?.addEventListener('click', () => toast('Launching preview (mock)'));

// FOOTER YEAR
$('#year') && ($('#year').textContent = new Date().getFullYear());

document.addEventListener("DOMContentLoaded", () => {
    const demoForm = document.getElementById("demoForm");
    const demoModal = document.getElementById("demoModal");
    const closeBtn = document.getElementById("closeModal");

    // Submit handler (can add validation but doesn't block closing anymore)
    demoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // optional: still check inputs
        demoModal.close();
        alert("Demo request submitted!");
    });

    // Manual close button (always works)
    closeBtn.addEventListener("click", () => demoModal.close());
});
