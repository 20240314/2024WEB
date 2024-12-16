let maintext = document.querySelector("h1")
window.addEventListener("scroll", function(){
    let value = window.scrollY;
    if(value > 30){
        maintext.style.animation = "disappear 2s ease-out forwards"; 
    } else {
        maintext.style.animation = "slide 2s ease-out ";
    }
});


let first_img = document.querySelector("#intro");
window.addEventListener("scroll", function(){
    let value = window.scrollY;
    if(value > 1200 && value < 1850){
        first_img.style.animation = "fadein 1.5s forwards"; 
    } else {
        first_img.style.animation = "fadeout 1.5s forwards";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const goToIndexButton = document.getElementById("go-to-main");
    goToIndexButton.addEventListener("click", () => {
        window.location.href = "../main/main.html";
    });
});

new TypeIt(".typingText", {
    strings: ["총 1027개의 영화, 드라마, 프로그램의 촬영지", "15000여개의 데이터 기반 여행지 코스 추천", "만족스러운 여행이 되시길 바랍니다." ],
    speed: 30,
    loop: true,
})
.go();


new TypeIt(".neon-content", {
    strings: ["영화 속으로", "떠나봅시다."],
    typeSpeed: 150,
    deleteSpeed: 50,
    loop: true,
})
.go();

window.addEventListener('DOMContentLoaded', function() {
    var scrollingText = document.querySelector('.scrolling-text');
    var scrollingTextWidth = scrollingText.clientWidth;
    var containerWidth = scrollingText.parentElement.clientWidth;
    
    var animationDuration = (scrollingTextWidth / containerWidth) * 10;
    scrollingText.style.animationDuration = animationDuration + 's';

    var paragraphs = document.querySelectorAll('.scrolling-text p');
    paragraphs.forEach((p, index) => {
        var delayTime = index * .3;
        p.style.animationDelay = delayTime + 's';

        p.addEventListener('animationend', function() {
            p.style.visibility = 'hidden'; 
        });

        p.addEventListener('animationstart', function() {
            p.style.visibility = 'visible';
        });
    });
});  
