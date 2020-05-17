const timings = JSON.parse(localStorage.leftTiming || '{}');
const hash = md5(parent.location.pathname);
const video = $('video');
$('head').append(`<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300&display=swap" rel="stylesheet">`);
if (timings && timings[hash] && timings[hash].t && video.length) {
    const show = _ => {
        const confirmation = $(`
            <div style="position: fixed;top: 0;right: 0;width: 100%;padding: 35px 15px;font-weight: bold;font-size: 1.2rem;direction: rtl;background: #000000d1;z-index: 9;transition: all .5s cubic-bezier(0.18, 0.89, 0.32, 1.28);transform: translateY(-100%);color: white;"
                class="egybetter">
                يبدو أنك توقفت عن المشاهدة آخر مرة في الدقيقة (${u.formatDuration(timings[hash].t)})
                أتريد الاستكمال من حين توقفت؟
                <a href="#" class="no" style="float: left;margin: 0 10px;">لا</a>
                <a href="#" class="yes" style="float: left;margin: 0 10px;">نعم</a>
            </div>
        `);
        if ($('div#video').length)
            $('div#video').prepend(confirmation);
        else {
            $('body').prepend(confirmation);
            $(document).ready(_ => setTimeout(_ => $('div#video').prepend(confirmation), 500));
        }
        // u.countdown(t => confirmation.find('.no').text(`لا (${t})`), 60)
        //     .then(_ => confirmation.find('.no')[0].click());
        confirmation.css('transform', '');
        confirmation.find('.yes,.no').on('click', e => {
            if ($(e.currentTarget).hasClass('yes'))
                video[0].currentTime = timings[hash].t;

            confirmation.css('transform', 'translateY(-100%)');
            delete timings[hash];
            localStorage.leftTiming = JSON.stringify(timings);
        });

    };

    if ($('.vjs-big-play-button').is(':visible')) $('.vjs-big-play-button').on('click', show);
    else show();

}

video.on('ended', _ => {
    initNav();
    if (top.nextEpisode())
        $('#video').html(`
            <h1 style='padding: 15px'>
                <div style="width:100%; text-align:center;">انتقال الى الحلقة التالية</div>
                <br>
                <div>
                    يمكنك الانتقال في أي وقت بالضغط على <code>SHIFT + N</code> (الحلقة التالية)
                    أو <code>SHIFT + P</code> (الحلقة السابقة)
                </div>
            </h1>
        `).css({ direction: 'rtl', 'font-size': '0.7rem' }).addClass('egybetter');
});
window.onbeforeunload = _ => {
    const time = video[0].currentTime;
    if (time > 60 && time < video[0].duration - 60) {
        const keys = Object.keys(timings);
        if (keys.length >= 1e4)
            delete timings[keys.sort((a, b) => timings[a].o - timings[b].o)[0]];
        timings[hash] = { t: Math.round(time - 3), o: Date.now() };
        localStorage.leftTiming = JSON.stringify(timings);
    }
};
let token = 0;
document.onkeydown = async e => {
    initNav();
    if (e.shiftKey && ['KeyN', 'KeyP'].includes(e.code) &&
        await (e.code == 'KeyN' ? top.nextEpisode() : top.prevEpisode())) {
        $('#video').html(`
            <h1>
                <div style="width:100%; text-align:center;">
                    انتقال الى الحلقة ${e.code == 'KeyN' ? 'التالية' : 'السابقة'}
                </div>
            </h1>
        `).css({ direction: 'rtl', 'font-size': '0.7rem' }).addClass('egybetter');
    }
}

function initNav() {
    for (const func of ['prevEpisode', 'nextEpisode'])
        !top[func] && (top[func] = _ => new Promise(r => {
            const t = token++;
            top.postMessage({ func: func + '_egyb', token: t }, 'https://egybest.org/');
            const h = e => {
                if (e.data.token == t) {
                    window.removeEventListener('message', h);
                    r(e.data.result);
                }
            };
            window.addEventListener('message', h);
        }));
}