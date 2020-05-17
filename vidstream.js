// window.stop();

// browser.runtime.sendMessage(undefined, {
//   removeCookies: location.host
// }, {}, () => {
// fetch(location.href).then((r) => r.text()).then((r) => {
//   var f = /function.+?\(\){(.+)}/g.exec(r)[1];
//   eval(f);
//   var d = /if\(!(_.+?)\).+?}} ?else/g.exec(r);
//   var code = d[0].replace(/else/g, '') + '}';
//   d = eval(code);
//   fetch('/cv.php').then().catch(r => {
//     $.ajax({
//       'url': "/cv.php?verify=" + d,
//       'cache': ![],
//       'method': "POST",
//       'data': JSON.parse(/{'_.+?':'.+?'}/g.exec(code)[0].replace(/'/g, '"').replace(/"no"/g, '"ok"'))
//     })
//   });
// });
if ($('.bigbutton._reload').length)
  browser.runtime.sendMessage(undefined, { refreshVidstream: location.host }, undefined);

top.postMessage({
  type: 'info_egybetter', host: location.host, activated: !$('.bigbutton._reload').length
}, '*');

if ($('.bigbutton._reload').length)
  $('.bigbutton._reload')[0].click();
else {
  top.postMessage({ type: 'vidstream_verified', url: location.href, host: location.host }, '*');
  console.log('done!');
}

// });


