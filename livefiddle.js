$(document).ready(function(){

  var ctx = document.getElementById("drawing")
                    .getContext('2d');

  ctx.canvas.width  = window.innerWidth;

  $(window).resize(function (){
    ctx.canvas.width  = window.innerWidth;
  });

  function highlight () {
    if (code.getSelection().isColor() && $(".miniColors-selector").length == 0 && $("#range").is(":hidden")) {
      $(".miniColors-selector").remove();
      $("#picker").miniColors("value", code.getSelection());
      setTimeout(function(){
        $(".miniColors-trigger").click();
        $(".miniColors-selector").css("top", $(".CodeMirror-selected").offset().top + 15);
        $(".miniColors-selector").css("left", $(".CodeMirror-selected").offset().left);
      },10);
    }

    if (("#" + code.getSelection()).isColor() && $(".miniColors-selector").length == 0 && $("#range").is(":hidden")) {
      $(".miniColors-selector").remove();
      $("#picker").miniColors("value", "#" + code.getSelection());
      setTimeout(function(){
        $(".miniColors-trigger").click();
        $(".miniColors-selector").css("top", $(".CodeMirror-selected").offset().top + 15);
        $(".miniColors-selector").css("left", $(".CodeMirror-selected").offset().left);
      },10);
    }

    if (code.getSelection() != "" && isFinite(code.getSelection())) {
      if($("#range").is(":hidden")){
        $("#range").show();
        var current = parseFloat(code.getSelection());
        if (Math.abs(current) < 1) {
          $("#range").attr("min",current-1);
          $("#range").attr("max",current+1);
        } else if (Math.abs(current) < 10) {
          $("#range").attr("min",current-5);
          $("#range").attr("max",current+5);
        } else if (Math.abs(current) < 100) {
          $("#range").attr("min",current-50);
          $("#range").attr("max",current+50);
        }
        $("#range").val(current);
        $("#range").css("top", $(".CodeMirror-selected").offset().top + 15);
        $("#range").css("left", $(".CodeMirror-selected").offset().left);
      }
    } else {
      $("#range").hide();
    }
  };

  var interval = setInterval(tick, 10);
  var code = CodeMirror.fromTextArea(document.getElementById("graph"), { onCursorActivity: highlight});
  var lastError = "";
  var initExecuted = false;

  $("#picker").miniColors({
    change: function(hex, rgb) {
      if (code.getSelection().indexOf("#") > -1 || (code.getSelection()).isColor() && !("#" + code.getSelection()).isColor()) {
        code.replaceSelection(hex);
      } else {
        code.replaceSelection(hex.replace("#",""));
      }
    }
  });

  $("#load").change(function(){
    code.setValue($("#" + $(this).val()).val());
    $("#restart").click();
  });

  $("#range").change(function(){
    code.replaceSelection("" + Math.round(parseFloat($(this).val())*10000)/10000);
  });

  $("#restart").click(function() {
    eval(code.getValue().match(/function init(.*[\s\S].*)*}/g)[0]);
    init();
    if (typeof(init) == "function") {
      initExecuted = false;
    }
  });

  $("#pause").click(function() {
    if ($(this).hasClass("paused")){
      interval = setInterval(tick, 10);
      $(this).attr("id","pause");
      $(this).html("Pause");
    } else {
      clearInterval(interval);
      $(this).attr("id","play");
      $(this).html("Play");
    }
    $(this).toggleClass("paused");
  });
  
  function tick() {
    try {

      if (initExecuted == false) {
        eval(code.getValue().match(/function init(.*[\s\S].*)*}/g)[0]);
        init();
        initExecuted = true;
      }
      ctx.restore();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      eval(code.getValue());


    } catch(err) {
      if (err != lastError) {
        console.log(err);
        lastError = err;
      }
    }
  }

  String.prototype.isColor = function () {
    var test = $("#test").css("color", this);

    if (test.attr("style") && (this.length > 6 && this.match("#") || !this.match("#")))
      return true;
    else
      return false;
  };
});
