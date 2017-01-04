
$(function () {
  window.cwriting = {};

  var fs = appNamel == 'rapixel' && fullscreen.enabled;
  var screenWidth = window.screen.width * (window.devicePixelRatio || 1);

  function addFsHandler($list) {
    $list.each(function () {
      var $writing = $(this);
      var $fs = $('<i class="fa fa-expand fs-icon"></i>');
      $fs.click(function () {
        var $img = $writing.find('img').eq(0); 
        var baseUrl = $img.attr('src').split('-',1)[0];
        var vers = $img.attr('data-vers').split(',');
        var ver;
        var i = 0;
        var minWidth = Math.max(screenWidth, 2560); // rapixel 섬네일 사이즈가 2560
        do {
          ver = vers[i];
          i++;
        } while (i < vers.length && vers[i] >= minWidth);
        var $fsImg = $('<img>').attr('src', baseUrl + '-' + ver + '.jpg');
        var $fs = $('#fullscreen');
        $fsImg.click(function () {
          fullscreen.exit();
        });
        $fs.append($fsImg);
        fullscreen.request($fs[0]);
        return false;
      });
      $writing.append($fs);
    });
  }

  fullscreen.onchange(function () {
    if (!fullscreen.inFullscreen()) {
      $fs = $('#fullscreen').empty();
    }
  });

  cwriting.initList = function () {
    sessionStorage.setItem('last-list-url', location);
    $('.writing-thumb .comment').each(function () {
      var $this = $(this);
      $this.html(tagUpText($this.html()));
    });
    if (fs) {
      addFsHandler($('.writing-thumb .writing'));
    }
  };

  cwriting.initNew = function () {
    var $form = formty.getForm('form.main');
    $form.$send.click(function (err, res) {
      formty.post('/api/writings', $form, function () {
        location = '/';
      });
      return false;
    });
  };

  cwriting.initUpdate = function (writing) {
    var $form = formty.getForm('form.main');
    $form.$send.click(function (err, res) {
      formty.put('/api/writings/' + writing._id, $form, function () {
        location = sessionStorage.getItem('last-list-url') || '/';
        //history.go(-2);
        //location = '/';
        //location = '/writings/' + writing._id;
      });
      return false;
    });
  };

  cwriting.initView = function (writing) {
    $('.writing-full img').click(function () {
      history.back();
      return false;
    });
    if (fs) {
      addFsHandler($('.writing-full .writing'));
    }

    var $comment = $('.writing-info .comment');
    $comment.html(tagUpText($comment.html()));

    $('#update-btn').click(function () {
      location = '/writings/' + writing._id + '/update';
      return false;
    });
    
    $('#del-btn').click(function () {
      $('#del-confirm-btn').removeClass('hide');
      return false;
    });
    
    $('#del-confirm-btn').click(function () {
      request.del('/api/writings/' + writing._id).end(function (err, res) {
        //err = err || res.error || res.body.err;
        err = err || res.body.err;
        if (err) return showError(res.body.err);
        location = '/';
      });
      return false;
    });
  };
});