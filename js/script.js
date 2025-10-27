/* =========================================================
   0) jQuery scrolla (요소 .animate 에서 data-animate 클래스를 토글)
   ========================================================= */
// $(function() {
//   if (!$ || !$.fn.scrolla) return;
//   $('.animate').scrolla({
//     mobile: true,
//     once: false
//   }).on('animate.scrolla', function(){
//     $(this).addClass($(this).data('animate'));
//   });
// });

/* 0) jQuery scrolla */
$(function () {
  if (!window.jQuery || !$.fn.scrolla) return;

  const $els = $('.animate');
  if ($els.length) {
    // 플러그인만 먼저 적용
    $els.scrolla({ mobile: true, once: false });

    // 이벤트는 별도로 바인딩
    $els.on('animate.scrolla', function () {
      $(this).addClass($(this).data('animate'));
    });
  }
});




/* =========================================================
   1) Swiper - about 이미지 슬라이더 (경고 없는 버전)
   ========================================================= */
(function () {
  if (typeof Swiper === 'undefined') return;

  const el = document.querySelector('.my-slider');
  const slideCount = el ? el.querySelectorAll('.swiper-slide').length : 0;

  // 반응형 slidesPerView
  const spv = window.innerWidth < 560 ? 1 : (window.innerWidth < 960 ? 2.5 : 5);

  // 슬라이드 개수에 따라 loop 자동 조정
  const canLoop = slideCount > spv;

  const swiper = new Swiper('.my-slider', {
    slidesPerView: spv,
    spaceBetween: 30,
    centeredSlides: true,
    loop: canLoop,
    watchOverflow: true,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    on: {
      slideChangeTransitionStart: updateSlideStyles,
      resize: function () {
        const w = window.innerWidth;
        const newSpv = w < 560 ? 1 : (w < 960 ? 2.5 : 5);
        const newCanLoop = slideCount > newSpv;
        this.params.slidesPerView = newSpv;
        this.params.loop = newCanLoop;
        this.update();
        updateSlideStyles(this);
      }
    }
  });

  // 초기 1회 적용
  requestAnimationFrame(() => updateSlideStyles(swiper));

  // 스타일 조정 함수
  function updateSlideStyles(swiper) {
    swiper.slides.forEach((slide, index) => {
      const i = (index - swiper.activeIndex + swiper.slides.length) % swiper.slides.length;
      slide.style.opacity = "0";
      if (i === 0) { slide.style.transform = 'scale(1) rotate(0deg)';   slide.style.opacity = "1"; }
      else if (i === 1) { slide.style.transform = 'scale(0.85) rotate(8deg)';  slide.style.opacity = "1"; }
      else if (i === swiper.slides.length - 1) { slide.style.transform = 'scale(0.85) rotate(-8deg)'; slide.style.opacity = "1"; }
    });
  }
})();



/* =========================================================
   2) journey-section : 배경 전환 + 구름 on 트리거 (자연스러운 페이드)
   ========================================================= */
(function(){
  const sec = document.querySelector('.journey-section');
  const overlay = document.querySelector('.journey-black-overlay');
  if(!sec || !overlay) return;

  let dark = false;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const r = e.intersectionRatio;
      // 아래로 스크롤: 진입하면 active 유지
      if(!dark && e.isIntersecting && r >= 0.65){
        overlay.classList.add('active'); // 블랙 오버레이 페이드 인
        sec.classList.add('on');
        dark = true;
      }
      // 위로 스크롤: journey-section이 화면에서 거의 사라지면 active 해제
      if(dark && !e.isIntersecting && r <= 0.05 && window.scrollY < sec.offsetTop){
        overlay.classList.remove('active'); // 페이드 아웃
        dark = false;
      }
    });
  },{
    threshold: Array.from({length: 21}, (_,i)=> i/20)
  });

  io.observe(sec);
})();

/* =========================================================
   3) hero 구간에 있을 때만 배경(.bg) 보이기
   ========================================================= */
(function(){
  const hero = document.querySelector('.hero');
  if(!hero) return;

  const set = (v) => document.body.classList.toggle('hero-in', v);

  const io = new IntersectionObserver(([entry]) => {
    set(entry.isIntersecting && entry.intersectionRatio > 0.1);
  }, { threshold: [0, 0.1, 1] });

  io.observe(hero);

  // 새로고침 위치 대응
  requestAnimationFrame(() => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const r = hero.getBoundingClientRect();
    const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
    set(visible > 0.1);
  });
})();


(function(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const sec   = document.querySelector('.lx-timeline');
  const track = sec && sec.querySelector('.lx-track');
  if (!sec || !track) return;

  // 수평 스크롤 거리
  const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth);

  // 수평 스크롤(핀 고정 + 스냅)
  const tween = gsap.to(track, {
    x: () => -getDist(),
    ease: "none",
    scrollTrigger: {
      trigger: sec,
      start: "top top",
      end: () => "+=" + getDist(),
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: (value) => {
          // 카드 기준 스냅
          const cards = track.querySelectorAll('.lx-card').length;
          if (cards <= 1) return 0;
          const steps = cards - 1;
          return Math.round(value * steps) / steps;
        },
        duration: 0.25,
        ease: "power1.out"
      }
    }
  });

  // 요소별 페이드업
  gsap.utils.toArray(".lx-card").forEach((card, idx) => {
    const head  = card.querySelector(".lx-head");
    const text  = card.querySelector(".lx-text");
    const media = card.querySelector(".lx-media");

    const items = [head, text, media].filter(Boolean);
    items.forEach((el, i) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            containerAnimation: tween,
            start: "left 72%",
            end: "left 45%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 살짝 스케일/틸트(이미지만)
    if (media){
      const img = media.querySelector('img');
      if (img){
        gsap.fromTo(img,
          { scale: 0.96, rotate: 0.2 },
          {
            scale: 1, rotate: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 70%",
              end: "left 40%",
              scrub: true
            }
          }
        );
      }
    }
  });

  // 리프레시
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh);
  window.addEventListener("resize", () => {
    clearTimeout(window.__lx_r);
    window.__lx_r = setTimeout(refresh, 120);
  });
})();






/* === Timeline: 도트 = '연도 라벨 오른쪽 + 24px' / 수평 고정 스크롤 / 페이드 === */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const sec   = document.querySelector('#timeline');
  const track = sec && sec.querySelector('.tl-track');
  if (!sec || !track) return;

  // 1) 도트 위치 계산: '연도 라벨 오른쪽 + 24px' (카드 로컬 좌표계)
  function computeDotPositions(){
    track.querySelectorAll('.tl-year').forEach((year) => {
      const label = year.querySelector('.tl-year-label');
      if (!label) return;
      const yRect = year.getBoundingClientRect();
      const lRect = label.getBoundingClientRect();
      const dotXLocal = Math.round((lRect.right - yRect.left) + 24);
      year.style.setProperty('--dotX', dotXLocal + 'px');
    });
    const axis = sec.querySelector('.tl-axis');
    if (axis) { axis.style.left = '0px'; axis.style.right = '0px'; }
  }

  // 2) 가로 스크롤 트윈(핀 고정) — 항상 '먼저' 만든다
  const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const tween = gsap.to(track, {
    x: () => -getDist(),
    ease: 'none',
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end:   () => '+=' + getDist(),
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // ─────────────────────────────────────────────────────
// 3) 카드별 등장(텍스트/이미지) — dot이 뷰포트 중앙에 왔을 때 '한 번만' 재생
// ─────────────────────────────────────────────────────
gsap.utils.toArray('#timeline .tl-year').forEach((card) => {
  const dot   = card.querySelector('.tl-dot');          // ★ 트리거를 dot로
  const text  = card.querySelector('.tl-text');
  const media = card.querySelector('.tl-media img');

  // 공통 트리거 옵션
  const baseTrigger = {
    trigger: dot || card,              // dot가 없으면 카드로 폴백
    containerAnimation: tween,         // 가로 스크롤과 동기화
    start: 'center center',            // ★ dot이 뷰포트 중앙에 왔을 때
    end: '+=1',                        // 끝 지점은 아주 짧게
    toggleActions: 'play none none none', // ★ 한 번만 재생(뒤로 갈 때도 유지)
    invalidateOnRefresh: true
    // markers: true,                  // 디버그용
  };

  if (text){
    gsap.fromTo(text,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: baseTrigger
      }
    );
  }

  if (media){
    gsap.fromTo(media,
      { scale: 0.95, rotate: 0.15, autoAlpha: 0 },
      { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: baseTrigger
      }
    );
  }
});


  // 4) 리프레시 파이프라인: 폰트/이미지 후 → 도트계산 → GSAP refresh
  function refreshAll(){
    computeDotPositions();
    ScrollTrigger.refresh();
  }
  // 폰트/이미지/로드 시점 커버
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshAll);
  window.addEventListener('load', refreshAll);
  // GSAP이 내부 리프레시 시작할 때도 도트 재계산
  ScrollTrigger.addEventListener('refreshInit', computeDotPositions);
  // 리사이즈 디바운스
  window.addEventListener('resize', () => {
    clearTimeout(window.__tl_r);
    window.__tl_r = setTimeout(refreshAll, 120);
  });

  // (옵션) iOS 등에서 아래 흰색 깜빡임 줄이기
  document.documentElement.style.overscrollBehaviorY = 'none';
})();











/* =========================================================
   5) WORKS 썸네일 호버 시 read-more 뱃지 표시 (마우스 따라다님)
   ========================================================= */
(function(){
  const works = document.querySelector('#works');
  const cta   = document.querySelector('.follow-cta');
  if (!works || !cta) return;

  let active = false, raf;

  function move(e){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      cta.style.left = e.clientX + 'px';
      cta.style.top  = e.clientY + 'px';
    });
  }

  function isThumb(el){
    return el.closest && el.closest('.work-card .thumb');
  }

  works.addEventListener('mousemove', (e)=>{
    if (!isThumb(e.target)) return;
    if (!active){
      active = true;
      cta.classList.add('show');
      document.body.style.cursor = 'none';
    }
    move(e);
  });

  works.addEventListener('mouseleave', ()=>{
    if (!active) return;
    active = false;
    cta.classList.remove('show');
    document.body.style.cursor = '';
  });

  works.addEventListener('mouseover', (e)=>{
    if (active && !isThumb(e.target)){
      active = false;
      cta.classList.remove('show');
      document.body.style.cursor = '';
    }
  });
})();


/* =========================================================
   6) WORKS 태그 배지 클릭 시 새창 프리셋(Pc/Tablet/Mobile)
   ========================================================= */
(function () {
  const sizes = {
    pc:     { w:1920, h:1080 },
    tablet: { w: 834, h:1112 },
    mobile: { w: 390, h: 844 }
  };

  document.querySelectorAll('.works .tags').forEach(ul => {
    ul.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-size]');
      if (!a) return;
      e.preventDefault();

      const baseURL = ul.dataset.url || a.getAttribute('href');
      if (!baseURL) return;

      const key = a.dataset.size;
      const s   = sizes[key];

      if (!s) { window.open(baseURL, '_blank', 'noopener'); return; }

      const w = Math.round(s.w), h = Math.round(s.h);
      const left = Math.max(0, Math.round((screen.availWidth  - w) / 2));
      const top  = Math.max(0, Math.round((screen.availHeight - h) / 2));

      const win = window.open(
        baseURL,
        `preview_${key}`,
        `width=${w},height=${h},left=${left},top=${top},` +
        `resizable=yes,menubar=no,toolbar=no,location=yes,status=no`
      );
      if (win) win.opener = null;
      else window.open(baseURL, '_blank', 'noopener');
    });
  });
})();


/* =========================================================
   7) CLONE CODING: hover 프리뷰 (JS 버전 사용 중이라면)
   ========================================================= */
(function () {
  const preview = document.getElementById('cc-preview');
  if (!preview) return;
  const imgEl   = preview.querySelector('img');
  const items   = document.querySelectorAll('.clone-item');

  items.forEach((item, idx) => {
    const url = item.getAttribute('data-img');

    item.addEventListener('mouseenter', () => {
      if (url){
        imgEl.src = url;
        preview.classList.remove('tilt-left','tilt-right');
        preview.classList.add( (idx % 2 === 0) ? 'tilt-left' : 'tilt-right' );
        preview.classList.add('show');
      }

      // 마키 텍스트가 짧으면 복제
      const track = item.querySelector('.track');
      if (track){
        const wrapper = item.querySelector('.ticker');
        const original = track.innerHTML;
        while (track.scrollWidth < wrapper.clientWidth * 2) {
          track.insertAdjacentHTML('beforeend', original);
        }
      }
    });

    item.addEventListener('mouseleave', () => {
      preview.classList.remove('show','tilt-left','tilt-right');
    });

    item.addEventListener('mousemove', (e) => {
      const x = e.clientX + 24;
      const y = e.clientY - 24;
      preview.style.left = x + 'px';
      preview.style.top  = y + 'px';
    });
  });
})();


/* =========================================================
   8) WORKS: 타이틀 → 서브타이틀 → 카드 → 카드 타이틀 순서 페이드업
   ========================================================= */
(function revealWorks(){
  const sec = document.querySelector('#works');
  if (!sec) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[WORKS] GSAP/ScrollTrigger not found. Fade-up animation skipped.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sec,
      start: "top 80%",  // 섹션 상단이 뷰포트 80% 지점에 오면 시작
      once: true
      // markers: true,
    }
  });

  tl.from(sec.querySelector('.title'), {
      y: 24, autoAlpha: 0, duration: 0.70, ease: "power2.out"
    })
    .from(sec.querySelector('.subtitle'), {
      y: 24, autoAlpha: 0, duration: 0.60, ease: "power2.out"
    }, "-=0.35")
    .from(sec.querySelectorAll('.work-card'), {
      y: 24, autoAlpha: 0, duration: 0.60, ease: "power2.out", stagger: 0.12
    }, "-=0.20")
    .from(sec.querySelectorAll('.work-card .w-title'), {
      y: 18, autoAlpha: 0, duration: 0.45, ease: "power2.out", stagger: 0.06
    }, "<+0.15");
})();







/* #works가 뷰포트에 25% 들어오면 .is-in 부착 (한 번만) */
(function(){
  function init(){
    const sec = document.getElementById('works');
    if(!sec) return;

    if ('IntersectionObserver' in window){
      const io = new IntersectionObserver(([entry])=>{
        if(entry.isIntersecting){
          sec.classList.add('is-in');
          io.disconnect();              // 재진입 때 또 재생하려면 이 줄 삭제
        }
      }, { threshold: 0.25 });
      io.observe(sec);
    } else {
      // IO 미지원 브라우저 폴백
      sec.classList.add('is-in');
    }
  }

  // DOMContentLoaded 보장: 스크립트가 head에 있어도 OK
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();





// JS 사용 플래그 (CSS에서 .js 프리픽스로 쓸 때)
document.documentElement.classList.add('js');

(function () {
  const sec = document.getElementById('clone');
  if (!sec) return;

  // ── 스크롤 방향 감지 (아주 가볍게)
  let lastY = window.scrollY;
  let dir   = 'down'; // 초기값은 down으로

  const onScroll = () => {
    const y = window.scrollY;
    // 미세 흔들림 방지 (2px 이하면 무시)
    if (Math.abs(y - lastY) > 2) {
      dir = (y > lastY) ? 'down' : 'up';
      lastY = y;
    }
  };
  // 패시브로 스크롤 성능 보장
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── IO 미지원 브라우저: 그냥 바로 실행
  if (!('IntersectionObserver' in window)) {
    sec.classList.add('is-in');
    return;
  }

  // ── 보일 때만 트리거, "내려갈 때만" class 추가
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      // ↓↓↓ 스크롤 "내려가는 중"에만 실행
      if (dir === 'down' && !sec.classList.contains('is-in')) {
        sec.classList.add('is-in'); // 등장!
      }
      // 올리면서 보이는 경우에는 아무 것도 안 함
    } else {
      // 섹션이 화면에서 벗어날 때 "올라가는 중"이면 클래스 제거해서
      // 다음에 다시 "내려올 때" 재생 가능
      if (dir === 'up' && sec.classList.contains('is-in')) {
        sec.classList.remove('is-in');
      }
    }
  }, {
    root: null,
    // 아래쪽 여백을 살짝 줄여 더 확실히 들어왔을 때 트리거
    rootMargin: '0px 0px -20%',
    threshold: 0.15
  });

  io.observe(sec);
})();













// ───────────────────────────────────────────────
// process.js (PORTFOLIO PROCESS 선 드로잉)
// ───────────────────────────────────────────────
// (function () {
//   if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
//   gsap.registerPlugin(ScrollTrigger);

//   // 옵션
//   const OVERDRAW = 3;   // 경계 잔상 방지 여유
//   const TRIM_END = 0;   // 일부만 남기고 멈추려면 px
//   const START_AT = "top 86%";   // August 느낌: 화면에 꽤 들어온 뒤 시작
//   const END_AT   = "bottom 45%"; // 화면 중간 즈음까지 계속 채워짐
//   const SCRUB    = 0.28;         // 스크롤 반응 민감도(0.25~0.35 권장)

//   document.querySelectorAll(".proc").forEach((section) => {
//     const svg  = section.querySelector(".proc-path");
//     const base = section.querySelector("#procBase");
//     const tmpl = section.querySelector("#procOverlay");
//     if (!svg || !base || !tmpl) return;

//     // 템플릿 강제 표시
//     tmpl.style.setProperty("opacity", "1", "important");

//     // base의 d를 서브패스로 분해
//     const dFull     = base.getAttribute("d") || "";
//     const segments  = dFull.trim().split(/(?=M)/g).map(s => s.trim()).filter(Boolean);

//     // 오버레이 경로 생성
//     const overPaths = [];
//     function makeOverlay(d, idx) {
//       const p = idx === 0 ? tmpl : tmpl.cloneNode(true);
//       if (idx !== 0) { svg.appendChild(p); p.removeAttribute("id"); }
//       p.setAttribute("d", d);
//       p.setAttribute("fill", "none");
//       p.setAttribute("stroke", "#22B7ED");
//       p.setAttribute("stroke-width", tmpl.getAttribute("stroke-width") || "4");
//       p.setAttribute("stroke-linecap", "butt");
//       p.setAttribute("vector-effect", "non-scaling-stroke");
//       p.style.setProperty("opacity", "1", "important");
//       return p;
//     }
//     segments.forEach((seg, i) => overPaths.push(makeOverlay(seg, i)));

//     // 초기값: 섹션 밖에서는 안 보이게
//     gsap.set(overPaths, { attr: { 'stroke-opacity': 0 } });

//     // 각 path 길이 및 "방향" 감지(위→아래로 보이게 sign 적용)
//     const lens = overPaths.map((p) => {
//       const len = p.getTotalLength();
//       const p0  = p.getPointAtLength(0);
//       const p1  = p.getPointAtLength(len);
//       const sign = (p0.y <= p1.y) ? 1 : -1; // 시작점이 더 위면 +, 아니면 -

//       p.__len  = len;
//       p.__sign = sign;

//       gsap.set(p, {
//         strokeDasharray: `${len} ${len}`,
//         strokeDashoffset: sign * (len + OVERDRAW) // sign으로 방향 통일
//       });
//       return len;
//     });
//     const totalLen = lens.reduce((a, b) => a + b, 0);

//     // 타임라인: 0→1로 선을 순차 드로잉
//     const tl = gsap.timeline({
//       defaults: { ease: "none" },
//       scrollTrigger: {
//         trigger: section,
//         start: START_AT,
//         end:   END_AT,
//         scrub: SCRUB,
//         invalidateOnRefresh: true,
//         // 섹션 안에서만 파란 선 보이기
//         onEnter:     () => gsap.set(overPaths, { attr: { 'stroke-opacity': 1 } }),
//         onEnterBack: () => gsap.set(overPaths, { attr: { 'stroke-opacity': 1 } }),
//         onLeave:     () => gsap.set(overPaths, { attr: { 'stroke-opacity': 0 } }),
//         onLeaveBack: () => gsap.set(overPaths, { attr: { 'stroke-opacity': 0 } }),
//         // markers: true,
//       }
//     });

//     // 서브패스 길이 비율대로 진행
//     lens.reduce((acc, len, i) => {
//       const dur = totalLen ? len / totalLen : 0;
//       const finalOffset = TRIM_END > 0 ? Math.max(0, TRIM_END) : 0;
//       tl.to(
//         overPaths[i],
//         { strokeDashoffset: finalOffset, immediateRender: false, duration: dur },
//         acc
//       );
//       return acc + dur;
//     }, 0);

//     // 리사이즈/폰트로드 시 재계산(방향 포함)
//     let t;
//     const rebuild = () => {
//       clearTimeout(t);
//       t = setTimeout(() => {
//         overPaths.forEach((p, idx) => {
//           const len = p.getTotalLength();
//           lens[idx] = len;

//           const p0 = p.getPointAtLength(0);
//           const p1 = p.getPointAtLength(len);
//           const sign = (p0.y <= p1.y) ? 1 : -1;

//           p.__len = len;
//           p.__sign = sign;

//           gsap.set(p, {
//             strokeDasharray: `${len} ${len}`,
//             strokeDashoffset: sign * (len + OVERDRAW)
//           });
//         });

//         const newTotal = lens.reduce((a, b) => a + b, 0);
//         tl.clear();
//         lens.reduce((acc, len, i) => {
//           const dur = newTotal ? len / newTotal : 0;
//           const finalOffset = TRIM_END > 0 ? Math.max(0, TRIM_END) : 0;
//           tl.to(overPaths[i], { strokeDashoffset: finalOffset, immediateRender: false, duration: dur }, acc);
//           return acc + dur;
//         }, 0);

//         ScrollTrigger.refresh();
//       }, 80);
//     };
//     window.addEventListener("resize", rebuild);
//     if (document.fonts?.addEventListener) {
//       document.fonts.addEventListener("loadingdone", rebuild);
//     }
//   });
// })();





 // 카드 링크 클릭 후 포커스 잔상 제거 (hover가 다시 정상 동작하도록)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.v-card .card-link');
    if (!a) return;
    // 기본 동작(새 탭 열기)은 그대로 두고, 다음 프레임에 포커스 해제
    requestAnimationFrame(() => a.blur());
  });






// (() => {
//   const track = document.getElementById('vTrack');
//   if (!track) return;

//   const GAP = 28;           // CSS --gap과 동일
//   const DURATION = 600;     // 한 칸 이동 애니메이션(ms)
//   const INTERVAL = 2600;    // 대기 후 다음 이동(ms)

//   let step = 0;             // 카드+갭 하나의 이동 거리
//   let timer = null;

//   // 현재 카드 폭 기준으로 step 재계산
//   function measure() {
//     const first = track.querySelector('.v-card');
//     if (!first) return;
//     step = first.getBoundingClientRect().width + GAP;
//   }

//   // 한 칸 이동 → 끝나면 첫 카드를 맨 뒤로 보내고 transform 리셋
//   function goNext() {
//     // 이동
//     track.style.transition = `transform ${DURATION}ms ease`;
//     track.style.transform = `translateX(${-step}px)`;

//     const onEnd = () => {
//       track.removeEventListener('transitionend', onEnd);

//       // 첫 카드를 맨 뒤로 이동
//       const firstCard = track.firstElementChild;
//       if (firstCard) track.appendChild(firstCard);

//       // 순간 리셋(깜빡임 방지)
//       track.style.transition = 'none';
//       track.style.transform = 'translateX(0)';
//       // reflow로 transition 재적용 준비
//       void track.offsetHeight;
//       track.style.transition = `transform ${DURATION}ms ease`;
//     };
//     track.addEventListener('transitionend', onEnd, { once: true });
//   }

//   function start() {
//     stop();
//     timer = setInterval(goNext, INTERVAL);
//   }
//   function stop() {
//     if (timer) { clearInterval(timer); timer = null; }
//   }

//   // 초기 측정 + 시작
//   measure();
//   start();

//   // 리사이즈 시 step 재계산(디바운스)
//   let r;
//   window.addEventListener('resize', () => {
//     clearTimeout(r);
//     r = setTimeout(() => { measure(); }, 120);
//   });

//   // hover 시 일시정지/재생
//   track.addEventListener('mouseenter', stop);
//   track.addEventListener('mouseleave', start);
// })();