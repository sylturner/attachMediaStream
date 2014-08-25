module.exports = function (stream, el, options) {
  // simple browser sniff
  var ua = window.navigator.userAgent.toLowerCase();
  if(ua.indexOf('firefox') !== -1 || ua.indexOf('chrome') !== -1){
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

    return element;
  }
  else {
    // make this work with the Temasys plugin for IE and Safari
    var element = el;
    stream.enableSoundTracks(true);
    if (element.nodeName.toLowerCase() !== 'audio') {
      var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
      if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
        var frag = document.createDocumentFragment();
        var temp = document.createElement('div');
        var classHTML = element.className ? 'class="' + element.className + '" ' :  '';
        temp.innerHTML = '<object id="' + elementId + '" ' + 
          classHTML + 'type="application/x-temwebrtcplugin">' + 
          '<param name="pluginId" value="' + elementId + '" /> ' + 
          '<param name="pageId" value="' + window.TemPageId + '" /> ' + 
          '<param name="windowless" value="true" /> ' + 
          '<param name="streamId" value="' + stream.id + '" /> ' + 
          '</object>';
        while (temp.firstChild) {
          frag.appendChild(temp.firstChild);
        }

        var rectObject = element.getBoundingClientRect();
        element.parentNode.insertBefore(frag, element);
        frag = document.getElementById(elementId);
        frag.width = rectObject.width + 'px'; 
        frag.height = rectObject.height + 'px';
        element.parentNode.removeChild(element);

      } else {
        var children = element.children;
        for (var i = 0; i !== children.length; ++i) {
          if (children[i].name === 'streamId') {
            children[i].value = stream.id;
            break;
          }
        }
        element.setStreamId(stream.id);
      }

      var newElement = document.getElementById(elementId);
      newElement.onclick = element.onclick ? element.onclick : function(arg) {};
      newElement._TemOnClick = function(id) {
        var arg = {srcElement: document.getElementById(id)};
        newElement.onclick(arg);
      };
      return newElement;
    } else { // is audio element
      // The sound was enabled, there is nothing to do here
      return element;
    }
  }
};
