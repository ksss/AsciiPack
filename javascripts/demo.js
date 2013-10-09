$(function(){
  var $demo_asciipack = $('#demo-asciipack');
  var $demo_json = $('#demo-json');

  $demo_json.focus();

  $demo_json.on('keyup', function(){
    var json = $('#demo-json').val();
    try {
      var obj = JSON.parse(json);
      var ap = AsciiPack.pack(obj);
      $demo_asciipack.html(ap);
    } catch (ex) {
    }
  });
});
