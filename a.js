// $("img, script, body").attr("onload", "window.open = function(url){fetch(url); return window;}");

let href;
let watchOverlay;
u.req('https://raw.githubusercontent.com/Sraq-Zit/egybetter/master/announcements.html').then(html => {
  if (html) return;
  let box = $('.verticalDynamic> .mbox');
  box.before(box = box.clone());
  box.find('.bdb>strong').text('EgyBetter');
  box.find('.pda:not(.bdb)>strong').attr('class', 'green').html(html);
});

document.onkeydown = e => { e.code == "Escape" && $('.i-min.egybetter')[0].click(); };
const f = async function (adblock = 1) {
  if (adblock && href == location.href) return;

  href = location.href;

  !/\/(movie|episode)\//g.test(location.href) &&
    watchOverlay && watchOverlay.hide().find('iframe').attr('src', 'about:blank');

  if (/\/(movie|episode)\//g.test(location.href)) {
    $('#watch_dl').attr('id', '__watch_dl');
    if (adblock && !$('#watch_dl').length) {
      $('#mainLoad>.msg_box.full').addClass('__egbSafe').text('سيتم استرجاع الفيديو..');
      fetch(location.href).then(t => t.text())
        .then(t => {
          if (!$('#watch_dl, #__watch_dl').length)
            $('#mainLoad>.msg_box.full').replaceWith($(t).find('.mbox+.msg_box').parent())
          $('#watch_dl').attr('id', '__watch_dl');
          f(0);
        });
      return;
    }
    let act;
    $('.dls_table').before(act = $('<strong/>', {
      class: 'msg_box notice i i-info activation egybetter',
      css: { float: 'left', width: '50%', 'text-align': 'center' },
      text: 'جاري التحميل..'
    }));
    const dl = g();
    dl.grabAll().finally(_ => act.text('انتهى') && setTimeout(() => act.fadeOut(), 2e3));

    const currentSelector = `a.movie[href*='${location.pathname}']`;
    const currentEp = $(currentSelector);
    const nextEp = $(currentSelector).prev();
    const prevEp = $(currentSelector).next();

    if (!watchOverlay) {
      watchOverlay = $(await fetch(browser.extension.getURL('overlay.html')).then(t => t.text()));
      watchOverlay.find('.next, .prev').on('click', e => watchOverlay.find('.bdb strong').text('بلاتي شوية..'));
      watchOverlay.find('img').attr('src', browser.extension.getURL('icon.png'));
      // watchOverlay.find('.i-close').on('click', _=>{
      //   if(confirm(''))
      // })
      $('body').prepend(watchOverlay);
    }
    $('#download').replaceWith($('<a/>', {
      href: '#', html: '<strong>أنقر للمشاهدة بطريقة EgyBetter!</strong>',
      class: 'mbox msg_box green egybetter_player', css: { 'text-align': 'center' }
    }).on('click', e => {
      e.preventDefault();
      localStorage.setItem('egybetter_player', 1);
      watchOverlay.css('display', 'flex') && $('.egybetter_player').hide();
      watchOverlay.css('top', 0);
    }));
    if (localStorage.getItem('egybetter_player')) $('.egybetter_player')[0].click();


    watchOverlay.find('.bdb>strong').text($('.movie_title>h1').eq(0).text());
    watchOverlay.find('iframe').attr('src', $(`#__watch_dl iframe`).attr('src'));
    watchOverlay.find('.next').css('visibility', nextEp.length ? '' : 'hidden')
      .text(nextEp.find('.title').text())
      .attr('href', nextEp.attr('href'));
    watchOverlay.find('.prev').css('visibility', prevEp.length ? '' : 'hidden')
      .text(prevEp.find('.title').text())
      .attr('href', prevEp.attr('href'));

    if (localStorage.getItem('hide_egyb_player'))
      watchOverlay.find('.i-lock.egybetter').addClass('i-unlock error') &&
        watchOverlay.find('.i-min.egybetter')[0].click();
    else
      watchOverlay.css('top', 0);




  }



  else if (location.href.includes("/season/")) {
    const eps = $(".movies_small:not(.contents) .movie");
    if (!eps.length) return href = null;

    fetch(browser.extension.getURL('idm_tuto.html')).then(t => t.text()).then(html => {
      html = html.replace('////', browser.extension.getURL(''));
      $('body').prepend(html);
    });

    const serieName = $('td.movie_title').parent().next().find('a').text();
    const imgURL = 'https://i.ya-webdesign.com/images/gif-loading-png-1.gif';
    const loader = $('<img/>', { src: imgURL, css: { width: 20, display: 'block', margin: '0 auto' } });
    const checker = loader.clone().attr('src', 'https://www.elfarsalicar.com/en/public/img/check.gif');
    const data = { num: {}, missed: {}, size: {}, downloads: {} };
    const table = $('<table/>', { class: 'dls_table btns full mgb egybetter' });
    table.append(`
      <thead>
        <tr>
          <th></th><th>الدقة</th><th>الحجم</th>
          <th>
            <a class='i i-help green' style='cursor:help;'
              onmousemove="$('.egybetter.idm_tuto').show()" 
              onmouseout="$('.egybetter.idm_tuto').hide()">حمل باستخدام IDM</a>
            أو انقر على
            <i class='i i-dl blue'></i>
            للتحميل على المتصفح
          </th>
        </tr>
      </thead>
    `);
    table.append(`<tbody></tbody>`);
    table.find('th').eq(0).width('9%').append(loader.clone());
    table.find('th').eq(1).width('17%');
    table.find('th').eq(2).width('14%');
    const tbody = table.find('tbody');
    $("#mainLoad .mbox[class='mbox']").eq(0).before([
      $('<center/>', {
        class: 'msg_box notice egybetter',
        html: '<strong><div>جاري الغلغلة.. </div><div class="activation egybetter"></div></strong>',
        css: { margin: 0, 'border-radius': 0 }
      }),
      table,
      $('<center/>', {
        class: 'msg_box warn كلاخء',
        html: `<strong>يمكنك تسريع العملية من هنا 
          <input type='checkbox' class='egybetter speedup' 
            onclick="localStorage.setItem('egyb_speedup', this.checked ? '1':'')"
            ${localStorage.getItem('egyb_speedup') ? 'checked' : ''}>
          (قد لا تعمل)
        </strong>
      `
      })
    ]);
    const notice = $('.msg_box.egybetter').find('div').eq(0);
    let c = 0;

    setTimeout(() => {
      if (!c && c < eps.length)
        notice.text('من الأسباب التي تؤخر هذه العملية vidstream لأنه يتطلب تغعيلا بين الحين والآخر، كما قد يكون السبب الأنترنيت الضعيفة أو مشكل بالموقع');
    }, 2e4);

    for (let i = eps.length - 1; i >= 0; i--) {
      const el = eps[i];
      const prom = g(el.href).grabAll().then(d => {
        const title = $(el).find('.title').text().trim();
        notice.text(`تم قصف ${title}`);
        for (const k in d.apiUrls) {
          const cls = k.replace(/[ ."'<]/g, '_').toLowerCase();
          if (!tbody.find('.' + cls).length) {
            data.downloads[k] = eps.toArray().map(el => '___' + $(el).children('.title').text().trim());
            data.size[k] = 0;
            data.num[k] = 0;
            data.missed[k] = data.missed[k] || 0;
            tbody.append(`<tr class="${cls}">${('<td>' + k + '</td>').repeat(4)}</tr>`);
          };
          if (!d.downloads[k]) {
            notice.text(`تبا، الجودة ${k} فشلت (${title})`);
            data.missed[k]++;
            continue;
          }
          const tds = tbody.find('.' + cls + '>td');
          tds.eq(2).text(u.convertSize((data.size[k] += parseFloat(d.info[k].size)) + 'MB', undefined, 2));
          data.downloads[k][i] = d.downloads[k];
        }
      }).catch(_ => {
        ["Full HD 1080p", "HD 720p", "SD 480p", "SD 360p", "Low 240p"]
          .forEach(k => data.missed[k] ? data.missed[k]++ : (data.missed[k] = 1));
        notice.text(`تبا، فشلت العملية في ${$(el).find('.title').text().trim()}`);
      }).finally(_ => {
        for (const k in data.num) {
          const cls = k.replace(/[ ."'<]/g, '_').toLowerCase();
          const tds = tbody.find('.' + cls + '>td');
          const missing = data.missed[k] ? `<span style='color:red'>(${data.missed[k]}-)</span> ` : '';
          tds.eq(0).html(`${missing} ${++data.num[k]}/${eps.length}`);
          tds.eq(3).html(
            $(`<textarea>${data.downloads[k].join('\n')}</textarea>`, { readonly: true })
              .on('mouseup', e => e.target.select())
          );
          if (c + 1 == eps.length)
            tds.eq(3).append(
              $('<a/>', { class: 'i i-dl egybetter', href: '#', css: { 'margin-right': '20px' }, title: 'التحميل عبر المتصفح' })
                .on('click', e => {
                  e.preventDefault();
                  const l = loader.clone().css({ margin: '0 30px', width: '45px', display: 'inline-block' });
                  $(e.currentTarget).hide().after(l);
                  const text = notice.text();
                  notice.text('سيتم بدء التحميل بعد قليل..');
                  const filename = l.next()[0].checked ? serieName : undefined;
                  browser.runtime.sendMessage(
                    { downloads: data.downloads[k], filename: filename },
                    _ => notice.text(text) && l.remove() && $(e.currentTarget).show()
                  );
                })
            )
              .append($('<input/>', {
                'data-q': k, type: 'checkbox',
                checked: Boolean(JSON.parse(localStorage.createSeriesFolder || '{}')[k])
              }).on('click', e => {
                const el = e.currentTarget;
                let chck = {};
                $(el).parents('table').find('input[type=checkbox]')
                  .each((_, elm) => chck[$(elm).data('q')] = elm.checked ? '1' : '');
                localStorage.createSeriesFolder = JSON.stringify(chck);
              }))
              .append(`<span style="width: max-content;">إنشاء مجلد بإسم المسلسل</span>`);
        }
        if (++c == eps.length) {
          table.find('th').eq(0).empty().append(checker);
          notice.text('بالصحة والراحة!');
          $('.activation.egybetter').empty();
        }
      });
      if (!(i % 2) && !$('.egybetter.speedup')[0].checked)
        await prom;
    }
  } else if (location.href.includes('/series/'))
    href = $('#mainLoad .mbox').eq(1).before([
      $('<strong/>', { class: 'mbox msg_box notice tam', text: 'للتحميل اختر أحد المواسم' }),
      $($('.contents').parents('.mbox').toArray().reverse())
    ]).length ? location.href : null;

}
f();
$('body').on('DOMSubtreeModified', f);

$('#head>.table').append(`
  <div class="td vam" align="center">
    <input class="egyb_switch" type="checkbox" id="egyb_switch" 
    ${localStorage.getItem('darkmode') ? 'checked' : ''}
    onclick="
        $('#egyb__darkmode_switcher').toggleClass('egyb__darkmode');
        localStorage.setItem('darkmode', this.checked ? '1' : '');
      ">
    <label type="checkbox" for="egyb_switch" title="Dark mode">
      <div class="i i-moon"></div>
    </label>
  </div>
`);
