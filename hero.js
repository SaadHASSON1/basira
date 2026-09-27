// The hero story: four platforms' bars and their trend line fold into BASIRA's eye as the page scrolls.
// Bars 1–2 become the lower lid, bars 3–4 the upper lid, and the trend's last data point becomes the pupil.
// The lids and the pupil sit in their own groups (#lowerG, #upperG, #pupilG) so a blink can move them without
// fighting the morph, which animates the paths inside.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || !window.MorphSVGPlugin) return; // CDN blocked: the static chart stays
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
  root.classList.add('story-on');

  // A reload starts the story again from the top. Left to itself the browser restores the old scroll position,
  // landing mid-story with the entrance and the scrubbed timeline both driving the words. A link to a section
  // (#download…) still goes where it points.
  // ScrollTrigger keeps its own scroll memory and puts scrollRestoration back to «auto», so it is told directly;
  // and the page is taken to the top as it unloads, which no restoration can undo.
  ScrollTrigger.clearScrollMemory('manual');
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('beforeunload', function () { window.scrollTo(0, 0); });

  var brand = getComputedStyle(root).getPropertyValue('--brand').trim();
  var lower = document.getElementById('lidLower').getAttribute('d');
  var upper = document.getElementById('lidUpper').getAttribute('d');
  var trend = document.getElementById('trend');
  var trendLength = trend.getTotalLength();

  function finalState() {
    gsap.set(['#bar1', '#bar2'], { morphSVG: lower, opacity: 1 });
    gsap.set(['#bar3', '#bar4'], { morphSVG: upper, opacity: 1 });
    gsap.set('#dot', { attr: { cx: 628, cy: 440, r: 63 }, fill: brand });
    gsap.set(['#trend', '.story-grid', '#line1'], { opacity: 0 });
    gsap.set('#line2', { opacity: 1, y: 0 });
  }

  if (reduce) {
    root.classList.add('story-still');
    finalState();
    return;
  }

  // The mark is centred by GSAP rather than CSS, so its own scale tween keeps the centring.
  gsap.set('.story-mark', { xPercent: -50, yPercent: -50, left: '50%', top: '50%' });

  // A blink: the whole eye closes into a line through the pupil's centre (628, 440 in the drawing) and opens again.
  // svgOrigin is in the drawing's own coordinates; a px transformOrigin is read against each group's own box, which
  // dropped the pupil below the eye (seen 2026-09-27).
  function blink(tl, at, close, open) {
    tl.to('#eyeG', { scaleY: 0.06, svgOrigin: '628 440', duration: close, ease: 'power2.in' }, at)
      .to('#eyeG', { scaleY: 1, svgOrigin: '628 440', duration: open, ease: 'power2.out' }, at + close);
    return tl;
  }

  // 1. On arrival: the chart builds itself — bars rise, the trend line draws, the data point lands. The words fade
  // in through their wrapper, so this never fights the scroll timeline, which owns each line's own opacity.
  gsap.set(trend, { strokeDasharray: trendLength, strokeDashoffset: trendLength });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.bar', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.14 })
    .to(trend, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.5')
    .from('#dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(3)' }, '-=0.15')
    .from('.story-words', { opacity: 0, y: 24, duration: 0.8 }, '-=0.7');

  // 2. On scroll (scrubbed, so it follows the finger both ways): the numbers become the eye, which then blinks.
  var story = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 1,
      onUpdate: function (self) { idle(self.progress > 0.97); },
    },
  });
  story
    .to('#line1', { opacity: 0, y: -30, duration: 0.12 }, 0.04)
    .to(['.story-grid', trend], { opacity: 0, duration: 0.16 }, 0.04)
    .to(['#bar1', '#bar2'], { morphSVG: { shape: lower, shapeIndex: 'auto' }, opacity: 1, duration: 0.4 }, 0.08)
    .to(['#bar3', '#bar4'], { morphSVG: { shape: upper, shapeIndex: 'auto' }, opacity: 1, duration: 0.4 }, 0.12)
    .to('#dot', { attr: { cx: 628, cy: 440, r: 63 }, fill: brand, duration: 0.38 }, 0.14)
    .fromTo('#line2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.14 }, 0.5);
  blink(story, 0.66, 0.07, 0.11);
  story.to('.story-mark', { scale: 0.92, duration: 0.2 }, 0.8).to({}, { duration: 0.05 }, 0.95);

  // 3. Resting at the end, the eye stays alive: a blink every few seconds.
  var idleTl = null;
  function idle(on) {
    if (on && !idleTl) {
      idleTl = blink(gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 1.2 }), 0, 0.12, 0.2);
    } else if (!on && idleTl) {
      idleTl.kill();
      idleTl = null;
      gsap.set('#eyeG', { scaleY: 1, svgOrigin: '628 440' });
    }
  }
})();

// The rest of the page: a quiet reveal — each block rises a little and fades in once, cards one after another.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = document.querySelectorAll(
    '.hero-grid > div > *, main section:not(.story) h2, .card, .checks li, .steps li, .download > *, details, .en p');
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true });
    },
  });
  // The download mark blinks when it comes into view: the same eye, one more time.
  var mark = document.querySelector('.download img:not([style*="none"])');
  if (mark) {
    gsap.fromTo('.download img', { scaleY: 1 }, {
      scaleY: 0.1, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut', transformOrigin: '50% 50%',
      scrollTrigger: { trigger: '.download', start: 'top 70%', once: true }, delay: 0.6,
    });
  }
})();
