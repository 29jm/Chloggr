var marginLeft = window.innerWidth/2 - 80;
var marginTop = window.innerHeight-70;

function enterAnimation(menu) {
    if(menu === ".pause") {
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

    if(menu === ".lose") {
        $( ".lose" ).velocity('transition.bounceUpIn');
        $( ".options" ).velocity('transition.fadeIn');
    }

    if(menu === "#gameContainer") {
        $( "#gameContainer" ).css('display', "initial");
    }

    if(menu === "#menuContainer") {
        $( "#menuContainer" ).velocity('transition.bounceDownIn')
    }

  	
}

function quitAnimation(menu) {
    if(menu === ".play") {
        $( ".play" ).velocity({
            width: "70px",
            height: "70px",
            top: marginTop,
            translateX: [0, 700],
            borderBottomLeftRadius: "0",
            opacity: "0.5",
        }, 900, [600, 25]).addClass("pause").removeClass("play");
        $( ".options" ).velocity('transition.fadeOut');
    }

    if(menu === ".lose") {
        $( ".lose" ).velocity('transition.bounceUpOut');
        $( ".options" ).velocity('transition.fadeOut');
    }

    if(menu === "#gameContainer") {
        $( "#gameContainer" ).velocity('transition.fadeOut')
    }

    if(menu === "#menuContainer") {
        $( "#menuContainer" ).velocity('transition.bounceDownOut')
    }

    
}
