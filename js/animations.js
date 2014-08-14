var marginLeft = window.innerWidth/2 - 80;
var marginTop = window.innerHeight-70;
var score;
var flag = 0;

function scoreAnimation() {
    score = Math.round(kloggr.score * 10 / kloggr.counter + kloggr.score * 5 );

    if(kloggr.score !== 0) {
        if(flag == score) {
            $("#scoreNumber").velocity('transition.bounceIn', 100);
            score = 0;// reset value of score
            flag = 0;
            return;
        }
        else {
            $("#scoreNumber").velocity('transition.bounceDownIn', 25);
            document.getElementById("scoreNumber").innerHTML = flag;
            flag++;
            setTimeout(scoreAnimation, 50);
        }
    }
    else {
        document.getElementById("scoreNumber").innerHTML = 0;
    }
}

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
        $( "#coin" ).velocity('transition.bounceUpIn');
        $( ".options" ).velocity('transition.fadeIn');
    }

    if(menu === "#gameContainer") {
        $( "#gameContainer" ).css('display', "initial");
    }

    if(menu === "#menuContainer") {
        $( "#menuContainer" ).velocity('transition.bounceDownIn')
        $( ".deadNumber, .highScore" ).velocity({
            opacity: '1', 
            width: "70px", 
            height: "70px", 
            lineHeight: "70px"
        });
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
        $( "#coin" ).velocity('transition.bounceUpOut');
        $( ".options" ).velocity('transition.fadeOut');
    }

    if(menu === "#gameContainer") {
        $( "#gameContainer" ).velocity('transition.fadeOut')
    }

    if(menu === "#menuContainer") {
        $( "#menuContainer" ).velocity('transition.bounceDownOut')
    }
}
