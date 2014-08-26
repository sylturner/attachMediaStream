module.exports = function (stream, el, options) {
  var URL = window.URL;
  var opts = {
    autoplay: true,
    mirror: false,
    muted: false
  };
  var element = el || document.createElement('video');
  var item;

  if (options) {
    for (item in options) {
      opts[item] = options[item];
    }
  }

  if (opts.autoplay) element.autoplay = 'autoplay';
  if (opts.muted) element.muted = true;
  if (opts.mirror) {
    ['', 'moz', 'webkit', 'o', 'ms'].forEach(function (prefix) {
      var styleName = prefix ? prefix + 'Transform' : 'transform';
      element.style[styleName] = 'scaleX(-1)';
    });
  }

  var ua = window.navigator.userAgent.toLowerCase();
  if(ua.indexOf('firefox') == -1 && ua.indexOf('chrome') == -1){
    var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
    if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
      var obj = document.createElement('object');
      obj.id = elementId;
      obj.type = "application/x-temwebrtcplugin"
      obj.innerHTML =
        '<param name="pluginId" value="' + elementId + '" /> ' +
        '<param name="pageId" value="' + window.TemPageId + '" /> ' +
        '<param name="windowless" value="true" /> ' +
        '<param name="streamId" value="' + stream.id + '" /> ';
      return obj;
    } else {
      var children = element.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          children[i].value = stream.id;
          break;
        }
      }
      element.setStreamId(stream.id);
      return element;
    }
  }
  else {
    // this first one should work most everywhere now
    // but we have a few fallbacks just in case.
    if (URL && URL.createObjectURL) {
      element.src = URL.createObjectURL(stream);
    } else if (element.srcObject) {
      element.srcObject = stream;
    } else if (element.mozSrcObject) {
      element.mozSrcObject = stream;
    } else {
      return false;
    }
  }

  return element;
};
