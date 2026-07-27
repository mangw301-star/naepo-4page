/* ==========================================================================
   내포더봄치과 — 공용 스크립트
   index.html / treatment.html / visit.html 3개 페이지가 공유합니다.
   ========================================================================== */

/* --------------------------------------------------------------------------
   ★ 여기만 채우면 3개 페이지의 모든 외부 링크가 한 번에 연결됩니다 ★

   HTML에 data-link="booking" 같은 속성이 붙은 <a> 태그를 찾아
   아래 주소를 자동으로 넣어줍니다. 파일마다 고칠 필요 없습니다.
   비워두면 해당 버튼은 화면에서 자동으로 숨겨집니다.
   -------------------------------------------------------------------------- */
var LINKS = {
  booking : '',   // 네이버 예약   예) https://booking.naver.com/booking/13/bizes/000000
  place   : '',   // 네이버 플레이스 예) https://map.naver.com/p/entry/place/0000000000
  blog    : 'https://blog.naver.com/den_read',   // 네이버 블로그  예) https://blog.naver.com/아이디
  kakao   : ''    // 카카오톡 채널  예) https://pf.kakao.com/_xxxxxx
};

(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;
  html.classList.add('js');

  /* ------------------------------------------------------------------------
     1. 외부 링크 주입
     ------------------------------------------------------------------------ */
  var unset = [];
  Object.keys(LINKS).forEach(function (key) {
    var url = LINKS[key];
    var nodes = document.querySelectorAll('[data-link="' + key + '"]');
    if (!url && nodes.length) unset.push(key);
    nodes.forEach(function (el) {
      if (url) {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
      // 주소가 없어도 지금은 버튼을 그대로 보여줍니다(레이아웃 확인용).
      // 실제 주소를 넣기 전까지는 href="#"라 눌러도 아무 동작 안 함에 유의하세요.
    });
  });
  if (unset.length && window.console) {
    console.warn('[내포더봄치과] app.js 상단 LINKS에 아직 주소가 없는 버튼(현재는 숨기지 않고 표시만 함): ' + unset.join(', '));
  }

  /* ------------------------------------------------------------------------
     2. 모바일 메뉴
     ------------------------------------------------------------------------ */
  var menuBtn = document.getElementById('menuBtn');
  var dim     = document.getElementById('navDim');

  function closeMenu() {
    body.classList.remove('menu-open', 'lock');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      body.classList.toggle('lock', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (dim) dim.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ------------------------------------------------------------------------
     3. 현재 페이지 표시 + 같은 페이지 안에서만 스크롤스파이
        (멀티페이지가 되면서 '#' + id 비교가 깨지므로 파일명 기준으로 판별)
     ------------------------------------------------------------------------ */
  var here = location.pathname.split('/').pop() || 'index.html';
  var gnbLinks   = document.querySelectorAll('nav.gnb a[href]');
  var localLinks = [];

  gnbLinks.forEach(function (a) {
    a.addEventListener('click', closeMenu);

    var href = a.getAttribute('href') || '';
    var hash = href.indexOf('#') > -1;
    var file = href.charAt(0) === '#' ? here : href.split('#')[0];

    if (file !== here) return;

    if (hash) {
      /* 같은 페이지 안의 앵커 — 스크롤 위치에 따라 .active 를 붙입니다.
         여러 개에 동시에 .current 를 주면 밑줄이 여러 개 생기므로 여기서는 넣지 않습니다. */
      localLinks.push(a);
    } else {
      /* 페이지 자체를 가리키는 링크 (예: treatment.html) */
      a.classList.add('current');
    }
  });

  if (localLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        localLinks.forEach(function (a) {
          var frag = (a.getAttribute('href') || '').split('#')[1];
          a.classList.toggle('active', frag === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------------------
     4. 같은 페이지 앵커 이동 — 헤더 높이만큼 보정
        다른 페이지로 가는 링크(treatment.html#tmj)는 그냥 통과시킵니다.
     ------------------------------------------------------------------------ */
  function headerH() {
    return parseInt(getComputedStyle(html).getPropertyValue('--header-h'), 10) || 74;
  }

  /* getBoundingClientRect 는 .reveal 의 translateY(34px) 까지 같이 재기 때문에
     스크롤 목표가 34px 어긋납니다. offsetTop 은 transform 의 영향을 받지 않습니다. */
  function docTop(el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }

  function goTo(el) {
    window.scrollTo(0, Math.max(0, docTop(el) - headerH() - 8));
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var hash = a.getAttribute('href');
      if (!hash || hash === '#') { e.preventDefault(); return; }

      if (hash === '#top') { e.preventDefault(); window.scrollTo(0, 0); closeMenu(); return; }

      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      goTo(target);
      history.replaceState(null, '', hash);
    });
  });

  /* 다른 페이지에서 #앵커를 달고 도착했을 때 헤더에 가리지 않도록 보정 */
  if (location.hash) {
    window.addEventListener('load', function () {
      var target = document.querySelector(location.hash);
      if (!target) return;
      setTimeout(function () { goTo(target); }, 60);
    });
  }

  /* ------------------------------------------------------------------------
     5. 스크롤 리빌
     ------------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        rev.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('show'); });
  }

  /* ------------------------------------------------------------------------
     6. 진료공간 투어 캐러셀 — 스와이프 + 키보드 지원
     ------------------------------------------------------------------------ */
  function initTour(root) {
    var track  = root.querySelector('.car-track');
    var slides = root.querySelectorAll('.car-slide');
    var nav    = root.querySelector('.tour-nav');
    var line   = root.querySelector('.tour-line');
    var prev   = root.querySelector('.car-arrow.prev');
    var next   = root.querySelector('.car-arrow.next');
    var n      = slides.length;
    var idx    = 0;
    var steps  = [];

    if (!track || !nav || !n) return;

    /* 타임라인 버튼 생성 */
    for (var k = 0; k < n; k++) {
      var label = slides[k].getAttribute('data-label') || ('공간 ' + (k + 1));
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tour-step';
      b.setAttribute('aria-label', label + ' 보기');
      b.innerHTML = '<span class="dot"></span><span class="txt"></span>';
      b.querySelector('.txt').textContent = label;
      if (k === 0) b.classList.add('on');
      (function (j) { b.addEventListener('click', function () { to(j); }); })(k);
      nav.appendChild(b);
      steps.push(b);
    }

    function to(x) {
      idx = (x + n) % n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      for (var j = 0; j < n; j++) {
        steps[j].classList.toggle('on', j === idx);
        /* 화면 밖 슬라이드는 스크린리더에서 숨깁니다 */
        slides[j].setAttribute('aria-hidden', j === idx ? 'false' : 'true');
        slides[j].inert = (j !== idx);
      }
      var s = steps[idx];
      nav.scrollLeft = Math.max(0, s.offsetLeft - (nav.clientWidth - s.offsetWidth) / 2);
    }

    function placeLine() {
      if (!line || n < 2) { if (line) line.style.width = '0'; return; }
      var a = steps[0], z = steps[n - 1], d = a.querySelector('.dot');
      var x1 = a.offsetLeft + a.offsetWidth / 2;
      var x2 = z.offsetLeft + z.offsetWidth / 2;
      line.style.left  = x1 + 'px';
      line.style.width = Math.max(0, x2 - x1) + 'px';
      line.style.top   = (a.offsetTop + d.offsetTop + d.offsetHeight / 2) + 'px';
    }

    if (prev) prev.addEventListener('click', function () { to(idx - 1); });
    if (next) next.addEventListener('click', function () { to(idx + 1); });

    /* 스와이프 */
    var startX = 0, startY = 0, dragging = false;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;  /* 세로 스크롤 우선 */
      to(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });

    /* 키보드 좌우 */
    root.setAttribute('tabindex', '0');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', '캐러셀');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); to(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); to(idx + 1); }
    });

    to(0);
    placeLine();
    window.addEventListener('resize', placeLine);
  }

  document.querySelectorAll('.tour').forEach(initTour);

  /* ------------------------------------------------------------------------
     7. 푸터 연도 자동 갱신
     ------------------------------------------------------------------------ */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

})();
