const g = url => new Grabber(url);
/** Class for grabbing download links */
class Grabber {

    /** @param {string} url URL of the episode */
    constructor(url) {
        /** URL of the episode
         * @type {string}
         */
        this.url = url || location.href;


        /** Info on the qualities
         * @type {string[]}
         */
        this.info = {};


        /** Egybest's api links of redirects to download url
         * @type {string[]}
         */
        this.apiUrls = {};

        /** Download links
         * @type {string[]}
         */
        this.downloads = {};


        /** Whether the url to process is the current opened page
         * @type {boolean}
         */
        this.isCurrentPage = typeof url == "undefined";
    }

    /** Grab all qualities download links
     * @returns {Promise<this>}
     */
    async grabAll() {
        return new Promise(async (r, rej) => {
            try {
                const doc = this.isCurrentPage ? $('html') : $(await u.req(this.url));
                doc.find("a.btn.g.dl._open_window").each((_, el) => {
                    const k = $(el).parent().prev().prev().text().trim();
                    this.apiUrls[k] = $(el).data('url');
                    this.info[k] = {
                        size: u.convertSize($(el).parent().prev().text().trim(), 'MB'),
                        qualityType: $(el).parent().prev().prev().prev().text().trim()
                    };
                    this.grab(k).then(d => {
                        this.downloads[k] = d;
                        if (Object.keys(this.apiUrls).length == Object.keys(this.downloads).length)
                            r(this);
                        if (!d) return;
                        $(el).hide().after(
                            $("<a/>", { text: "تحميل بدون صداع الرأس", href: d, class: "btn g" })
                        );
                    });
                });
            } catch (error) {
                console.error(error);
                rej(error);
            }
        });
    }

    /** Grab download link for selected quality
     * @param {string} q Selected quality
     * @returns {Promise<string>} Download link
     */
    async grab(q) {
        let url = $('<a/>', { href: this.apiUrls[q] })[0].href;
        let src = null;
        let tries = 3;
        while (tries--) {
            try {
                const doc = $(await u.req({ url: url, cache: false, xhrFields: { withCredentials: true } }));
                if (src = doc.find('.ico-down-circle').parent()[0].href) break;
            } catch (error) { console.error(error) }

            const _url = await u.activateVidstream(url);
            while (!_url && !u.canActivate) { await u.sleep(500); }
            if (_url) url = _url;
            else tries++;
        }
        return src;
    }
}