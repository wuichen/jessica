'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var loadScript = require('load-script2');

var YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

var YOUTUBE_STATES = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'paused',
  '3': 'buffering',
  '5': 'cued'
};

var YOUTUBE_ERROR = {
  // The request contains an invalid parameter value. For example, this error
  // occurs if you specify a videoId that does not have 11 characters, or if the
  // videoId contains invalid characters, such as exclamation points or asterisks.
  INVALID_PARAM: 2,

  // The requested content cannot be played in an HTML5 player or another error
  // related to the HTML5 player has occurred.
  HTML5_ERROR: 5,

  // The video requested was not found. This error occurs when a video has been
  // removed (for any reason) or has been marked as private.
  NOT_FOUND: 100,

  // The owner of the requested video does not allow it to be played in embedded
  // players.
  UNPLAYABLE_1: 101,

  // This error is the same as 101. It's just a 101 error in disguise!
  UNPLAYABLE_2: 150
};

var loadIframeAPICallbacks = [];

/**
 * YouTube Player. Exposes a better API, with nicer events.
 * @param {HTMLElement|selector} element
 */

var YouTubePlayer = function (_EventEmitter) {
  _inherits(YouTubePlayer, _EventEmitter);

  function YouTubePlayer(element, opts) {
    _classCallCheck(this, YouTubePlayer);

    var _this = _possibleConstructorReturn(this, (YouTubePlayer.__proto__ || Object.getPrototypeOf(YouTubePlayer)).call(this));

    var elem = typeof element === 'string' ? document.querySelector(element) : element;

    if (elem.id) {
      _this._id = elem.id; // use existing element id
    } else {
      _this._id = elem.id = 'ytplayer-' + Math.random().toString(16).slice(2, 8);
    }

    _this._opts = Object.assign({
      width: 640,
      height: 360,
      autoplay: false,
      captions: undefined,
      controls: true,
      keyboard: true,
      fullscreen: true,
      annotations: true,
      modestBranding: false,
      related: true,
      info: true,
      timeupdateFrequency: 1000
    }, opts);

    _this.videoId = null;
    _this.destroyed = false;

    _this._api = null;
    _this._player = null;
    _this._ready = false; // is player ready?
    _this._queue = [];

    _this._interval = null;

    // Setup listeners for 'timeupdate' events. The YouTube Player does not fire
    // 'timeupdate' events, so they are simulated using a setInterval().
    _this._startIntervalBound = function () {
      return _this._startInterval();
    };
    _this._stopIntervalBound = function () {
      return _this._stopInterval();
    };

    _this.on('unstarted', _this._stopIntervalBound);
    _this.on('ended', _this._stopIntervalBound);
    _this.on('playing', _this._startIntervalBound);
    _this.on('paused', _this._stopIntervalBound);
    _this.on('buffering', _this._stopIntervalBound);

    _this._loadIframeAPI(function (err, api) {
      if (err) return _this._destroy(new Error('YouTube Iframe API failed to load'));
      _this._api = api;

      // If load(videoId) was called before Iframe API loaded, ensure it gets
      // called again now
      if (_this.videoId) _this.load(_this.videoId);
    });
    return _this;
  }

  _createClass(YouTubePlayer, [{
    key: 'load',
    value: function load(videoId, autoplay) {
      if (this.destroyed) return;
      if (autoplay == null) autoplay = true;

      this.videoId = videoId;

      // If the Iframe API is not ready yet, do nothing. Once the Iframe API is
      // ready, `load(this.videoId)` will be called.
      if (!this._api) return;

      // If there is no player instance, create one.
      if (!this._player) {
        this._createPlayer(videoId);
        return;
      }

      // If the player instance is not ready yet, do nothing. Once the player
      // instance is ready, `load(this.videoId)` will be called. This ensures that
      // the last call to `load()` is the one that takes effect.
      if (!this._ready) return;

      // If the player instance is ready, load the given `videoId`.
      if (autoplay) {
        this._player.loadVideoById(videoId);
      } else {
        this._player.cueVideoById(videoId);
      }
    }
  }, {
    key: 'play',
    value: function play() {
      if (this._ready) this._player.playVideo();else this._queueCommand('play');
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this._ready) this._player.pauseVideo();else this._queueCommand('pause');
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this._ready) this._player.stopVideo();else this._queueCommand('stop');
    }
  }, {
    key: 'seek',
    value: function seek(seconds) {
      if (this._ready) this._player.seekTo(seconds, true);else this._queueCommand('seek', seconds);
    }
  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      if (this._ready) this._player.setVolume(volume);else this._queueCommand('setVolume', volume);
    }
  }, {
    key: 'setPlaybackRate',
    value: function setPlaybackRate(rate) {
      if (this._ready) this._player.setPlaybackRate(rate);else this._queueCommand('setPlaybackRate', rate);
    }
  }, {
    key: 'getVolume',
    value: function getVolume() {
      return this._ready && this._player.getVolume() || 0;
    }
  }, {
    key: 'getPlaybackRate',
    value: function getPlaybackRate() {
      return this._ready && this._player.getPlaybackRate() || 1;
    }
  }, {
    key: 'getAvailablePlaybackRates',
    value: function getAvailablePlaybackRates() {
      return this._ready && this._player.getAvailablePlaybackRates() || [1];
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this._ready && this._player.getDuration() || 0;
    }
  }, {
    key: 'getProgress',
    value: function getProgress() {
      return this._ready && this._player.getVideoLoadedFraction() || 0;
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this._ready && YOUTUBE_STATES[this._player.getPlayerState()] || 'unstarted';
    }
  }, {
    key: 'getCurrentTime',
    value: function getCurrentTime() {
      return this._ready && this._player.getCurrentTime() || 0;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._destroy();
    }
  }, {
    key: '_destroy',
    value: function _destroy(err) {
      if (this.destroyed) return;
      this.destroyed = true;

      if (this._player) {
        this._player.stopVideo();
        this._player.destroy();
      }

      this.videoId = null;

      this._id = null;
      this._opts = null;
      this._api = null;
      this._player = null;
      this._ready = false;
      this._queue = null;

      this._stopInterval();
      this._interval = false;

      this.removeListener('playing', this._startIntervalBound);
      this.removeListener('paused', this._stopIntervalBound);
      this.removeListener('buffering', this._stopIntervalBound);
      this.removeListener('unstarted', this._stopIntervalBound);
      this.removeListener('ended', this._stopIntervalBound);

      this._startIntervalBound = null;
      this._stopIntervalBound = null;

      if (err) this.emit('error', err);
    }
  }, {
    key: '_queueCommand',
    value: function _queueCommand(command) {
      if (this.destroyed) return;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._queue.push([command, args]);
    }
  }, {
    key: '_flushQueue',
    value: function _flushQueue() {
      while (this._queue.length) {
        var command = this._queue.shift();
        this[command[0]].apply(this, command[1]);
      }
    }
  }, {
    key: '_loadIframeAPI',
    value: function _loadIframeAPI(cb) {
      // If API is loaded, there is nothing else to do
      if (window.YT && typeof window.YT.Player === 'function') {
        return cb(null, window.YT);
      }

      // Otherwise, queue callback until API is loaded
      loadIframeAPICallbacks.push(cb);

      var scripts = Array.from(document.getElementsByTagName('script'));
      var isLoading = scripts.some(function (script) {
        return script.src === YOUTUBE_IFRAME_API_SRC;
      });

      // If API <script> tag is not present in the page, inject it. Ensures that
      // if user includes a hardcoded <script> tag in HTML for performance, another
      // one will not be added
      if (!isLoading) {
        loadScript(YOUTUBE_IFRAME_API_SRC, function (err) {
          if (err) {
            while (loadIframeAPICallbacks.length) {
              var loadCb = loadIframeAPICallbacks.shift();
              loadCb(err);
            }
          }
        });
      }

      // If ready function is not present, create it
      if (typeof window.onYouTubeIframeAPIReady !== 'function') {
        window.onYouTubeIframeAPIReady = function () {
          while (loadIframeAPICallbacks.length) {
            var loadCb = loadIframeAPICallbacks.shift();
            loadCb(null, window.YT);
          }
        };
      }
    }
  }, {
    key: '_createPlayer',
    value: function _createPlayer(videoId) {
      var _this2 = this;

      if (this.destroyed) return;

      var opts = this._opts;

      this._player = new this._api.Player(this._id, {
        width: opts.width,
        height: opts.height,
        videoId: videoId,
        playerVars: {
          // This parameter specifies whether the initial video will automatically
          // start to play when the player loads. Supported values are 0 or 1. The
          // default value is 0.
          autoplay: opts.autoplay ? 1 : 0,

          // Setting the parameter's value to 1 causes closed captions to be shown
          // by default, even if the user has turned captions off. The default
          // behavior is based on user preference.
          cc_load_policy: opts.captions != null ? opts.captions ? 1 : 0 : undefined, // default to not setting this option

          // This parameter indicates whether the video player controls are
          // displayed. For IFrame embeds that load a Flash player, it also defines
          // when the controls display in the player as well as when the player
          // will load. Supported values are:
          //   - controls=0 – Player controls do not display in the player. For
          //                  IFrame embeds, the Flash player loads immediately.
          //   - controls=1 – (default) Player controls display in the player. For
          //                  IFrame embeds, the controls display immediately and
          //                  the Flash player also loads immediately.
          //   - controls=2 – Player controls display in the player. For IFrame
          //                  embeds, the controls display and the Flash player
          //                  loads after the user initiates the video playback.
          controls: opts.controls ? 2 : 0,

          // Setting the parameter's value to 1 causes the player to not respond to
          // keyboard controls. The default value is 0, which means that keyboard
          // controls are enabled.
          disablekb: opts.keyboard ? 0 : 1,

          //  Setting the parameter's value to 1 enables the player to be
          //  controlled via IFrame or JavaScript Player API calls. The default
          //  value is 0, which means that the player cannot be controlled using
          //  those APIs.
          enablejsapi: 1,

          // Setting this parameter to 0 prevents the fullscreen button from
          // displaying in the player. The default value is 1, which causes the
          // fullscreen button to display.
          fs: opts.fullscreen ? 1 : 0,

          // Setting the parameter's value to 1 causes video annotations to be
          // shown by default, whereas setting to 3 causes video annotations to not
          // be shown by default. The default value is 1.
          iv_load_policy: opts.annotations ? 1 : 3,

          // This parameter lets you use a YouTube player that does not show a
          // YouTube logo. Set the parameter value to 1 to prevent the YouTube logo
          // from displaying in the control bar. Note that a small YouTube text
          // label will still display in the upper-right corner of a paused video
          // when the user's mouse pointer hovers over the player.
          modestbranding: 1,

          // This parameter provides an extra security measure for the IFrame API
          // and is only supported for IFrame embeds. If you are using the IFrame
          // API, which means you are setting the enablejsapi parameter value to 1,
          // you should always specify your domain as the origin parameter value.
          origin: window.location.origin,

          // This parameter controls whether videos play inline or fullscreen in an
          // HTML5 player on iOS. Valid values are:
          //   - 0: This value causes fullscreen playback. This is currently the
          //        default value, though the default is subject to change.
          //   - 1: This value causes inline playback for UIWebViews created with
          //        the allowsInlineMediaPlayback property set to TRUE.
          playsinline: 1,

          // This parameter indicates whether the player should show related videos
          // when playback of the initial video ends. Supported values are 0 and 1.
          // The default value is 1.
          rel: opts.related ? 1 : 0,

          // Supported values are 0 and 1. Setting the parameter's value to 0
          // causes the player to not display information like the video title and
          // uploader before the video starts playing. If the player is loading a
          // playlist, and you explicitly set the parameter value to 1, then, upon
          // loading, the player will also display thumbnail images for the videos
          // in the playlist. Note that this functionality is only supported for
          // the AS3 player.
          showinfo: opts.info ? 1 : 0,

          // (Not part of documented API) Allow html elements with higher z-index
          // to be shown on top of the YouTube player.
          wmode: 'opaque'
        },
        events: {
          onReady: function onReady() {
            return _this2._onReady(videoId);
          },
          onStateChange: function onStateChange(data) {
            return _this2._onStateChange(data);
          },
          onPlaybackQualityChange: function onPlaybackQualityChange(data) {
            return _this2._onPlaybackQualityChange(data);
          },
          onPlaybackRateChange: function onPlaybackRateChange(data) {
            return _this2._onPlaybackRateChange(data);
          },
          onError: function onError(data) {
            return _this2._onError(data);
          }
        }
      });
    }

    /**
     * This event fires when the player has finished loading and is ready to begin
     * receiving API calls.
     */

  }, {
    key: '_onReady',
    value: function _onReady(videoId) {
      if (this.destroyed) return;

      this._ready = true;

      // If the videoId that was loaded is not the same as `this.videoId`, then
      // `load()` was called twice before `onReady` fired. Just call
      // `load(this.videoId)` to load the right videoId.
      if (videoId !== this.videoId) {
        this.load(this.videoId);
      }

      this._flushQueue();
    }

    /**
     * Called when the player's state changes. We emit friendly events so the user
     * doesn't need to use YouTube's YT.PlayerState.* event constants.
     */

  }, {
    key: '_onStateChange',
    value: function _onStateChange(data) {
      if (this.destroyed) return;

      var state = YOUTUBE_STATES[data.data];

      if (state) {
        this.emit(state);
      } else {
        console.error('Unrecognized state change', data);
      }
    }

    /**
     * This event fires whenever the video playback quality changes. Possible
     * values are: 'small', 'medium', 'large', 'hd720', 'hd1080', 'highres'.
     */

  }, {
    key: '_onPlaybackQualityChange',
    value: function _onPlaybackQualityChange(data) {
      if (this.destroyed) return;
      this.emit('playbackQualityChange', data.data);
    }

    /**
     * This event fires whenever the video playback rate changes.
     */

  }, {
    key: '_onPlaybackRateChange',
    value: function _onPlaybackRateChange(data) {
      if (this.destroyed) return;
      this.emit('playbackRateChange', data.data);
    }

    /**
     * This event fires if an error occurs in the player.
     */

  }, {
    key: '_onError',
    value: function _onError(data) {
      if (this.destroyed) return;

      var code = data.data;

      // The HTML5_ERROR error occurs when the YouTube player needs to switch from
      // HTML5 to Flash to show an ad. Ignore it.
      if (code === YOUTUBE_ERROR.HTML5_ERROR) return;

      // The remaining error types occur when the YouTube player cannot play the
      // given video. This is not a fatal error. Report it as unplayable so the user
      // has an opportunity to play another video.
      if (code === YOUTUBE_ERROR.UNPLAYABLE_1 || code === YOUTUBE_ERROR.UNPLAYABLE_2 || code === YOUTUBE_ERROR.NOT_FOUND || code === YOUTUBE_ERROR.INVALID_PARAM) {
        return this.emit('unplayable', this.videoId);
      }

      // Unexpected error, does not match any known type
      this._destroy(new Error('YouTube Player Error. Unknown error code: ' + code));
    }

    /**
     * This event fires when the time indicated by the `getCurrentTime()` method
     * has been updated.
     */

  }, {
    key: '_onTimeupdate',
    value: function _onTimeupdate() {
      this.emit('timeupdate', this.getCurrentTime());
      this.emit('progress', this.get);
    }
  }, {
    key: '_startInterval',
    value: function _startInterval() {
      var _this3 = this;

      this._interval = setInterval(function () {
        return _this3._onTimeupdate();
      }, this._opts.timeupdateFrequency);
      this._onTimeupdate();
    }
  }, {
    key: '_stopInterval',
    value: function _stopInterval() {
      clearInterval(this._interval);
      this._interval = null;
    }
  }]);

  return YouTubePlayer;
}(EventEmitter);

module.exports = YouTubePlayer;