videojs('vid_player').ready(function() {
    this.hotkeys({
      volumeStep: 0.1,
      seekStep: 5,
      enableModifiersForNumbers: false
    });
    console.log("hotkey")
  });