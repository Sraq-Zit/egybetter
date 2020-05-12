/** Static class of utils */
class Utils {

    /** Async form of setTimeout
     * @param {number} timeout
     * @returns {Promise<void>}
     */
    static sleep(timeout) { return new Promise(r => setTimeout(r, timeout)); }

    /** Perform a customized countdown
     * @param {(timeLeft: number)=>void} onstep Fires when a step has passed
     * @param {number} timeout Duration of the countdown in seconds
     * @param {number} [step=1] Seconds by which the countdown ticks (dafault: 1)
     * @returns {Promise<void>}
     */
    static async countdown(onstep, timeout, step = 1) {
        onstep = typeof onstep == 'function' ? onstep : _ => _;
        do {
            onstep(timeout);
            await Utils.sleep(step * 1e3);
        } while ((timeout -= step) > 0);
        return;
    }

    /** Request the resources and bypass CORS policy
     * @param {string | JQuery.AjaxSettings} option URL or object of ajax settings
     * @returns {Promise<string>}
     */
    static async req(option) {
        if (typeof option == 'string')
            option = { url: option, dataType: "html" };

        if (!option.type && !option.method) option.type = 'GET';

        return new Promise((r, e) => $.ajax({ ...option, success: r, error: err => e(err) }));
    }

    /** Activate vidstream to offer download links
     * @param {string} url URL to be activated
     * @returns {Promise}
     */
    static async activateVidstream(url) {
        if (this.canActivate === false) return;
        const f = e => {
            if (!e.originalEvent.data) return;
            if (e.originalEvent.data.type == 'info_egybetter' && e.originalEvent.data.activated) {
                $('.activation.egybetter').text(`تفعيل ${e.originalEvent.data.host}..`);
                $(window).off('message', f);
            }
        };
        $(window).on('message', f);
        this.canActivate = false;
        const selector = '#____vidstream_activation';
        const iframe = $(selector).length ? $(selector) : $('<iframe/>');
        $('body').append(iframe.attr({
            id: selector.replace('#', ""), src: url,
            sandbox: 'allow-scripts allow-forms allow-same-origin'
        }).hide());
        url = await new Promise(r => {
            const handler = e => {
                if (e.originalEvent.data.type == 'vidstream_verified') {
                    $(window).off('message', handler);
                    $('.activation.egybetter').text(`تم تفعيل ${e.originalEvent.data.host}!`);
                    iframe.attr('src', 'about:blank');
                    r(e.originalEvent.data.url);
                }
            };

            $(window).on('message', handler);

            // setTimeout(r, 1e4);
        });
        this.canActivate = true;
        return url;
    }


    /** Convert size to given unit
     * @param {string} value Value to convert. The value must contain a unit at the end
     * @param {'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'} unit Target unit to convert the value to
     * @param {number} [fractionDigits] Number of digits after decimal point
     * @returns {string}
     */
    static convertSize(value, unit, fractionDigits) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
        if (typeof unit != 'undefined' && !units.includes(unit.toUpperCase()))
            throw 'Unsupported or wrong unit: ' + unit;

        value = value.toUpperCase();
        let u = new RegExp(units.join('|')).exec(value);
        u = u && u[0];
        value = parseFloat(value.replace(/[^0-9.e-]/gi, ''));

        if (typeof unit == 'undefined') {
            if (![0, units.length - 1].includes(units.indexOf(u)))
                if (value >= 1024)
                    return Utils.convertSize(Utils.convertSize(value + u, units[units.indexOf(u) + 1]), unit, fractionDigits);
                else if (value < 1)
                    return Utils.convertSize(Utils.convertSize(value + u, units[units.indexOf(u) - 1]), unit, fractionDigits);
            return (fractionDigits == undefined ? value : value.toFixed(fractionDigits)) + u;
        }

        value = value * 1024 ** (units.indexOf(u) - units.indexOf(unit));
        if (fractionDigits && typeof fractionDigits == 'number')
            value = value.toFixed(fractionDigits);

        return value += unit;
    }

    /** Format duration from seconds to hh:mm:ss format
     * @param {object} time Seconds to conver
     * @returns {string}
     */
    static formatDuration(time) {
        let t = [],
            x;
        if ((x = parseInt(time / 3600)) >= 1) {
            t.push((x || 0).toString().padStart(2, 0));
            time %= 3600;
        }
        t.push((parseInt(time / 60) || 0).toString().padStart(2, 0));
        time %= 60;
        t.push((parseInt(time) || 0).toString().padStart(2, 0));
        return t.join(":");
    }




}

const u = Utils
const browser = window.browser || chrome;

$.ajax = function (data) {
    data.ajax = 1;
    const c = { success: data.success, error: data.error };
    for (const k of ['success', 'error']) delete data[k];
    chrome.runtime.sendMessage(undefined, data, undefined, function (response) {
        c[response.callback] &&
            c[response.callback](response.resp1, response.resp2, response.resp3);
    });
};

const script = document.createElement('script');
script.innerHTML = `window.open=function(url){fetch(url);return window};Function.prototype.t=Function.prototype.toString;Function.prototype.toString=function(){if(this == window.open)return"function open() { [native code] }";return this.t()}`;
document.documentElement.append(script);
const darkmode_switcher = $('<div/>', { id: 'egyb__darkmode_switcher' });
if (localStorage.getItem('darkmode')) darkmode_switcher.addClass('egyb__darkmode');
document.documentElement.append(darkmode_switcher[0]);
