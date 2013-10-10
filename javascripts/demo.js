$(function(){
  var $demo_asciipack = $('#demo-asciipack');
  var $demo_json = $('#demo-json');
  var json = $('#demo-json').val();
  var obj = JSON.parse(json);
  var ap = AsciiPack.pack(obj);

  $demo_json.focus();
  $demo_asciipack.html(ap);

  $demo_json.on('keyup', function(){
    json = $('#demo-json').val();
    try {
      obj = JSON.parse(json);
      ap = AsciiPack.pack(obj);
      $demo_asciipack.html(ap);
    } catch (ex) {
    }
  });
});
