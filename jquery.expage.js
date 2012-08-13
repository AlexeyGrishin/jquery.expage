//CSS notes
// expageCtr - container
// expageVisible - elements that will be not hidden
// expageHidden - elements inside container that will be hidden on expand
// expageExpanged - added to container when expanded

//Events notes
// expage.expand
// expage.collapse

(function($) {
  $.fn.hasScrollBar = function() {
    return this.get(0).scrollHeight > this.height();
  }
})(jQuery);


function Expage(element, options) {

  this.options = {
    expanded: false,
    expandButton: true,
    collapseButton: true,
    changeHash: true  //false, true, or String
  };
  $.extend(this.options, options);

  this.obj = $(element);
  this.objParent = this.obj.parent();
  this.fullScreenContainer = $("<div class='expageCtr'></div>")
    .appendTo($("body"))
    .css({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    });
  this.fullScreenContainer.hide();

  (function prepareButtons() {
    if (typeof this.options.expandButton === 'string') {
      this.options.expandButton = $(this.options.expandButton);
    }
    else if (this.options.expandButton === true) {
      this.options.expandButton = $("<div class='expageExpand expageHidden'><a class='btn' href='javascript:void(0);'>Expand</a></div>");
      this.objParent.css({position: "relative"});
      if (this.objParent.hasScrollBar()) {
        this.objParent.before(this.options.expandButton);
      }
      else {
        this.obj.before(this.options.expandButton);
      }
    }

    if (this.options.expandButton) {
      $(this.options.expandButton).click(this.expand.bind(this));
    }

    //TODO: duplicates
    if (typeof this.options.collapseButton === 'string') {
      this.options.collapseButton = $(this.options.collapseButton);
    }
    else if (this.options.collapseButton === true) {
      this.options.collapseButton = $("<div class='expageCollapse'><a class='btn' href='javascript:void(0);'><< Back</a></div>");
      var collapseCtr = $("<div class='navbar navbar-fixed-top expageCollapseCtr'><div class='navbar-inner'></div> </div>")
        .css({
          position: "fixed",
          height: 40,
          top: 0,
          left: 0,
          right: 0
        });
      collapseCtr.find(".navbar-inner").append(this.options.collapseButton);
      this.fullScreenContainer.append(collapseCtr);
      this.fullScreenContainer.css({
        paddingTop: 40
      })
    }
    if (this.options.collapseButton) {
      $(this.options.collapseButton).click(this.collapse.bind(this));
    }
  }.bind(this))();
  this.expanded = false;
  if (this.options.expanded) {
    this.expand();
  }

  if (this.options.changeHash) {
    if (this.options.changeHash === true) {
      this.options.changeHash = this.obj.attr("id");
    }
    if (document.location.hash == "#expand-"+this.options.changeHash) {
      this.expand();
    }
  }
};

Expage.prototype = {
  expand: function() {
    if (this.expanded) return;
    if (Expage.expandedOne) Expage.expandedOne.collapse();
    $("body").children().not(".expageCtr").not(".expageVisible").add(".expageHidden").hide();
    this.fullScreenContainer.prepend(this.obj.show()).show().addClass("expageExpanged");
    if (this.options.changeHash) {
      document.location.hash = "#expand-"+this.options.changeHash;
    }
    Expage.prototype.expandedOne = this;
    this.expanded = true;
    this.obj.trigger("expage.expand");

  },

  collapse: function() {
    if (!this.expanded) return;
    $("body").children().not(".expageCtr").not(".expageVisible").add(".expageHidden").show();
    this.objParent.append(this.obj);
    this.fullScreenContainer.hide().removeClass("expageExpanged");
    if (this.options.changeHash) {
      document.location.hash = null;
    }
    Expage.expandedOne = undefined;
    this.expanded = false;
    this.obj.trigger("expage.collapse");
  },

  toggle: function() {
    if (this.expanded) this.collapse(); else this.expand();
  }
}


$.fn.expage = function(commandOrOptions) {
  if (typeof commandOrOptions !== 'string') {
    this.each(function() {
      $(this).data("expage", new Expage($(this), commandOrOptions))
    })
  }
  else {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    this.each(function() {
      var expage = $(this).data("expage");
      expage[commandOrOptions].call(expage, args);
    })
  }
  return this;
}

$(function() {
  $(".expage").expage();
  if (screen.width < 1000 && typeof(window.ontouchstart) != 'undefined') {
    $(".expage-tablet").expage();
  }
})

if (typeof(Function.prototype.bind) == 'undefined') {
  Function.prototype.bind = function(context) {
    var that = this;
    return function() {
      return that.call(context, arguments);
    }
  }
}