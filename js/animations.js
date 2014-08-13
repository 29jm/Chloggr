var marginLeft = window.innerWidth/2 - 80;
var marginTop = window.innerHeight-70;

function pauseAnimation() {
  	$( ".pause" ).velocity({
    	width: "10em",
    	height: "10em",
    	top: "7em",
    	translateX: [0, -700],
    	borderRadius: "50%",
    	opacity: "1",
  		}, 900, [600, 25]).removeClass("pause").addClass("play");

  	$( ".options" ).velocity('transition.fadeIn');
}
function loseAnimation() {
    $( ".lose" ).velocity('transition.bounceUpIn');
    $( ".options" ).velocity('transition.fadeIn');
}

function playAnimation(menu) {
    if(menu === ".play") {
        $( ".play" ).velocity({
        width: "70px",
        height: "70px",
        top: marginTop,
        translateX: [0, 700],
        borderBottomLeftRadius: "0",
        opacity: "0.5",
      }, 900, [600, 25]).addClass("pause").removeClass("play");
    }
    if(menu === ".lose") {
        $( ".lose" ).velocity('transition.bounceUpOut');
    }
    
    $( ".options" ).velocity('transition.fadeOut');
}
