(function(){

  // todo https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

  var caret = true,
    title = document.title.toString();

  window.setInterval(function () {
    document.title = title + (caret ? '|' : '');
    caret = !caret;
  }, 700);

})();
