// The hero story: four platforms' bars and their trend line fold into BASIRA's eye as the page scrolls.
// Bars 1–2 become the lower lid, bars 3–4 the upper lid, and the trend's last data point becomes the pupil.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || !window.MorphSVGPlugin) return; // CDN blocked: the static chart stays
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
  root.classList.add('story-on');

  var brand = getComputedStyle(root).getPropertyValue('--brand').trim();
  var lower = document.getElementById('lidLower').getAttribute('d');
  var upper = document.getElementById('lidUpper').getAttribute('d');
  var trend = document.getElementById('trend');
  var trendLength = trend.getTotalLength();

  function finalState() {
    gsap.set(['#bar1', '#bar2'], { morphSVG: lower, opacity: 1 });
    gsap.set(['#bar3', '#bar4'], { morphSVG: upper, opacity: 1 });
    gsap.set('#dot', { attr: { cx: 628, cy: 440, r: 63 }, fill: brand });
    gsap.set(['#trend', '.story-grid', '#line1', '#hint'], { opacity: 0 });
    gsap.set('#line2', { opacity: 1, y: 0 });
  }

  if (reduce) {
    root.classList.add('story-still');
    finalState();
    return;
  }

  // 1. On arrival: the chart builds itself — bars rise, the trend line draws, the data point lands.
  gsap.set(trend, { strokeDasharray: trendLength, strokeDashoffset: trendLength });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.bar', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.12 })
    .to(trend, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.4')
    .from('#dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' }, '-=0.15')
    .from('#line1', { opacity: 0, y: 24, duration: 0.7 }, '-=0.6')
    .from('#hint', { opacity: 0, duration: 0.6 }, '-=0.2');

  // 2. On scroll (scrubbed, so it follows the finger both ways): the numbers become the eye.
  var story = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '.story', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });
  story
    .to('#hint', { opacity: 0, duration: 0.08 }, 0)
    .to('#line1', { opacity: 0, y: -30, duration: 0.18 }, 0.06)
    .to(['.story-grid', trend], { opacity: 0, duration: 0.2 }, 0.05)
    .to(['#bar1', '#bar2'], { morphSVG: { shape: lower, shapeIndex: 'auto' }, opacity: 1, duration: 0.45 }, 0.12)
    .to(['#bar3', '#bar4'], { morphSVG: { shape: upper, shapeIndex: 'auto' }, opacity: 1, duration: 0.45 }, 0.16)
    .to('#dot', { attr: { cx: 628, cy: 440, r: 63 }, fill: brand, duration: 0.42 }, 0.18)
    // a single blink once the eye is whole
    .to(['#bar3', '#bar4'], { y: 70, duration: 0.05, ease: 'power1.in' }, 0.7)
    .to(['#bar1', '#bar2'], { y: -70, duration: 0.05, ease: 'power1.in' }, 0.7)
    .to('#dot', { scaleY: 0.2, transformOrigin: '50% 50%', duration: 0.05 }, 0.7)
    .to(['.bar', '#dot'], { y: 0, scaleY: 1, duration: 0.07, ease: 'power1.out' }, 0.75)
    .fromTo('#line2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.58)
    .to('.story-mark', { scale: 0.9, duration: 0.3 }, 0.7);
})();
