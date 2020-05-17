const browser = window.browser || chrome;

browser.webRequest.onHeadersReceived.addListener(
  function (info) {
    var headers = info.responseHeaders;
    var index = headers.findIndex(x => x.name.toLowerCase() == "x-frame-options");
    if (index != -1) {
      headers.splice(index, 1);
    }
    return {
      responseHeaders: headers
    };
  }, {
  urls: ['<all_urls>'], //
  types: ["sub_frame", "xmlhttprequest"]
},
  ['blocking', 'responseHeaders']
);

// browser.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     return {
//       cancel: details.initiator.includes('egybetter.org')
//     };
//   }, {
//   urls: ["*://native.propellerclick.com/*", "*://dlzm790g.com/*", "*://velocitycdn.com/*", "*://onclickmega.com/*", "*://onclicksuper.com/*", "*://deloton.com/*", "*://go.onclasrv.com/*", "*://www.youradexchange.com/*", "*://c.adexchangemachine.com/*"]
// },
//   ["blocking"]
// );

// browser.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     if (!details.url.includes("//egybest.org") && /(.+?\.)?egybest\..+\/.*/g.test(details.url))
//       return { redirectUrl: "https://egybest.org" + details.url.match(/^https?:\/\/[^\/]+([\S\s]*)/)[1] };
//   },
//   {
//     urls: [
//       "*://*/*",
//     ],
//     types: ["main_frame", "sub_frame", "xmlhttprequest"]
//   },
//   ["blocking"]
// );

const tabs = new Set;
browser.tabs.onUpdated.addListener((tabId, b, c, d, e) => {
  browser.tabs.get(tabId, tab => {
    const url = tab.url;
    if (!url.includes("//egybest.org") && /(.+?\.)?egybest\..+\/.*/g.test(url) && !tabs.has(tabId)) {
      tabs.add(tabId);
      browser.tabs.update(tabId, {
        url: "https://egybest.org" + url.match(/^https?:\/\/[^\/]+([\S\s]*)/)[1]
      });
    }
    if (url.includes("//egybest.org")) tabs.delete(tabId);
  })
});
let canRefresh = false;



browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  if (message.ajax) {
    delete message.ajax;
    message.success = (resp) => sendResponse({
      resp1: resp,
      callback: "success"
    });
    message.error = (a, b, c) => sendResponse({
      resp1: a,
      resp2: b,
      resp3: c,
      callback: "error"
    });
    $.ajax(message);
    return true;
  }
  if (message.vid && canRefresh) {
    canRefresh = false;
    setTimeout(() => canRefresh = true, 10 * 1000);
    frame.attr('src', message.vid);
  }

  if (message.refreshVidstream)
    browser.cookies.remove({ url: 'https://' + message.refreshVidstream, name: '__cfduid' });

  if (message.downloads) {
    let c = 0;
    message.filename = message.filename && message.filename
    message.downloads.forEach(d => {
      if (d && d.slice(0, 4) == 'http')
        browser.downloads.download({
          url: d,
          filename: message.filename && message.filename + /\/[^/]+?$/.exec(d)[0],
          saveAs: false
        }, _ => (++c) == message.downloads.length && sendResponse());
      else (++c) == message.downloads.length && sendResponse();
    });
    return true
  }

  if (message.ad) {
    frame.attr('src', 'about:blank');
    frame.attr('src', message.ad);
  }

});

var frame = $("<iframe/>", { sandbox: 'allow-scripts allow-forms allow-same-origin' });
$("body").append(frame);
