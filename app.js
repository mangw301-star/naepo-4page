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
  // 네이버 예약 페이지가 열리면 아래를 그 주소로 교체하세요.
  //   예) https://booking.naver.com/booking/13/bizes/000000
  // 그전까지는 전화·예약이 가능한 네이버 플레이스로 연결해 예약 버튼을 살려둡니다.
  booking : 'https://booking.naver.com/booking/16/bizes/1721113',   // 네이버 예약
  place   : 'https://map.naver.com/p/entry/place/2039834402',   // 네이버 플레이스
  blog    : 'https://blog.naver.com/den_read',   // 네이버 블로그  예) https://blog.naver.com/아이디
  kakao   : 'https://pf.kakao.com/_WrxniX'    // 카카오톡 채널
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
        // URL이 채워지면 정상 링크로 자동 복원
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
        el.removeAttribute('hidden');
        el.removeAttribute('aria-disabled');
        el.removeAttribute('tabindex');
        el.classList.remove('link-unavailable');
      } else {
        // URL이 없는 버튼은 공개 화면과 탭 순서에서 완전히 숨깁니다.
        el.setAttribute('hidden', '');
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('tabindex', '-1');
        el.classList.add('link-unavailable');
      }
    });
  });
  if (unset.length && window.console) {
    console.warn('[내포더봄치과] app.js 상단 LINKS에 주소가 없어 숨겨진 버튼: ' + unset.join(', ') + ' (URL을 넣으면 자동 표시)');
  }

  /* ------------------------------------------------------------------------
     1-1. 히어로 영상 (index)
     - 움직임 최소화(prefers-reduced-motion) 사용자는 재생을 멈추고 poster만 표시
     - 영상 파일이 아직 없거나 로드에 실패해도 poster/딥그린 면이 그대로 유지
     ------------------------------------------------------------------------ */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    var motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var applyMotionPref = function () {
      if (motionMq.matches) {
        heroVideo.removeAttribute('autoplay');
        heroVideo.pause();
      }
    };
    applyMotionPref();
    if (motionMq.addEventListener) motionMq.addEventListener('change', applyMotionPref);

    var lastSource = heroVideo.querySelector('source:last-of-type');
    if (lastSource) {
      // 모든 source가 실패하면 마지막 source에서 error가 발생 — poster 상태로 유지
      lastSource.addEventListener('error', function () {
        heroVideo.removeAttribute('autoplay');
      });
    }
  }

  /* ------------------------------------------------------------------------
     1-2. 메인 첫 화면 — 영상 위에서는 헤더를 투명하게 (index 전용)
     ------------------------------------------------------------------------ */
  var heroSection = document.querySelector('.hero');
  if (heroSection) {
    var syncHeroTop = function () {
      var limit = heroSection.offsetHeight - (parseInt(getComputedStyle(html).getPropertyValue('--header-h'), 10) || 74);
      body.classList.toggle('hero-top', window.scrollY < limit);
    };
    syncHeroTop();
    window.addEventListener('scroll', syncHeroTop, { passive: true });
    window.addEventListener('resize', syncHeroTop);
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

  /* 앵커바(페이지 내 탭)도 같은 스파이로 현재 위치를 표시합니다 */
  var barLinks = Array.prototype.slice.call(document.querySelectorAll('.anchorbar a[href^="#"]'));

  if ((localLinks.length || barLinks.length) && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        localLinks.forEach(function (a) {
          var frag = (a.getAttribute('href') || '').split('#')[1];
          a.classList.toggle('active', frag === id);
        });
        barLinks.forEach(function (a) {
          var frag = (a.getAttribute('href') || '').split('#')[1];
          a.classList.toggle('active', frag === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    /* 앵커바 대상은 section이 아닌 div인 경우도 있어 직접 관찰 목록에 추가 */
    barLinks.forEach(function (a) {
      var frag = (a.getAttribute('href') || '').split('#')[1];
      var t = frag && document.getElementById(frag);
      if (t) spy.observe(t);
    });

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
  } else {
    /* 해시 없이 메뉴 등으로 '새로 진입(navigate)'한 경우 항상 최상단에서 시작.
       뒤로가기(back_forward)·새로고침(reload)의 브라우저 스크롤 복원은 건드리지 않습니다. */
    var navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    if (!navEntry || navEntry.type === 'navigate') {
      window.scrollTo(0, 0);
    }
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

/* ── 홈 공지 팝업 (추석 연휴 진료 안내) ──────────────────────────
   POP_UNTIL(포함)까지만 표시하고, 날짜가 지나면 아무것도 하지 않습니다.
   '오늘 하루 보지 않기'는 이 브라우저에 오늘 날짜를 저장하는 방식입니다.
   다음 공지에 재사용: index.html의 팝업 문구와 아래 날짜만 바꾸면 됩니다. */
(function () {
  var pop = document.getElementById('holidayPop');
  var dim = document.getElementById('holidayDim');
  if (!pop || !dim) return;

  var POP_UNTIL = '2026-09-26';        /* 추석 연휴 진료일 — 이날까지 표시 */
  var KEY = 'popHide-' + POP_UNTIL;

  function two(n) { return n < 10 ? '0' + n : '' + n; }
  var now = new Date();
  var today = now.getFullYear() + '-' + two(now.getMonth() + 1) + '-' + two(now.getDate());

  if (today > POP_UNTIL) return;                       /* 기간 종료 */
  try { if (localStorage.getItem(KEY) === today) return; } catch (e) {}

  var closeBtn = document.getElementById('holidayPopClose');
  var todayBtn = document.getElementById('holidayPopToday');
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    dim.hidden = false;
    pop.hidden = false;
    document.body.classList.add('pop-open');
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }
  function close() {
    dim.hidden = true;
    pop.hidden = true;
    document.body.classList.remove('pop-open');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    /* 팝업 밖으로 초점이 나가지 않게 순환시킵니다 */
    var focusables = pop.querySelectorAll('a[href], button');
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  closeBtn.addEventListener('click', close);
  dim.addEventListener('click', close);
  todayBtn.addEventListener('click', function () {
    try { localStorage.setItem(KEY, today); } catch (e) {}
    close();
  });

  /* 첫 화면이 그려진 직후에 띄웁니다 */
  setTimeout(open, 400);
})();
