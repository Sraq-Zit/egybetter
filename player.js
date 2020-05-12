const timings = JSON.parse(localStorage.leftTiming || '{}');
const hash = md5(parent.location.pathname);
if (timings && timings[hash] && timings[hash].t && $('video').length) {
    const show = _ => {
        const confirmation = $(`
            <div style="position: fixed;top: 0;right: 0;width: calc(100% - 30px);padding: 15px;font-weight: bold;font-size: 1rem;direction: rtl;background: #000000d1;z-index: 9;transition: all .5s cubic-bezier(0.18, 0.89, 0.32, 1.28);transform: translateY(-100%);color: white;">
                يبدو أنك توقفت عن المشاهدة آخر مرة في الدقيقة (${u.formatDuration(timings[hash].t)})
                أتريد الاستكمال من حين توقفت؟
                <a href="#" class="no" style="float: left;margin: 0 10px;">لا</a>
                <a href="#" class="yes" style="float: left;margin: 0 10px;">نعم</a>
            </div>
        `);

        $('body').prepend(confirmation);

        // u.countdown(t => confirmation.find('.no').text(`لا (${t})`), 60)
        //     .then(_ => confirmation.find('.no')[0].click());
        confirmation.css('transform', '');
        confirmation.find('.yes,.no').on('click', e => {
            if ($(e.currentTarget).hasClass('yes'))
                $('div#video video')[0].currentTime = timings[hash].t;

            confirmation.css('transform', 'translateY(-100%)');
            delete timings[hash];
            localStorage.leftTiming = JSON.stringify(timings);
        });
    
    };

    if ($('.vjs-big-play-button').is(':visible')) $('.vjs-big-play-button').on('click', show);
    else show();
}

window.onbeforeunload = _ => {
    const time = $('div#video video')[0].currentTime;
    if (time > 60 && time < $('div#video video')[0].duration - 60) {
        const keys = Object.keys(timings);
        if (keys.length >= 1e4)
            delete timings[keys.sort((a, b) => timings[a].o - timings[b].o)[0]];
        timings[hash] = { t: Math.round(time - 3), o: Date.now() };
        localStorage.leftTiming = JSON.stringify(timings);
    }
};
