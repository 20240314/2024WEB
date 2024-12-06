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
    loop: true, // 반복 여부
  })
  .go();


  new TypeIt(".neon-content", {
    strings: ["영화 속으로", "떠나봅시다."],
    typeSpeed: 150, // 타이핑 속도 조절
    deleteSpeed: 50, // 지우는 속도
    loop: true, // 반복 여부
  })
  .go();

window.addEventListener('DOMContentLoaded', function() {
    var scrollingText = document.querySelector('.scrolling-text');
    var scrollingTextWidth = scrollingText.clientWidth;
    var containerWidth = scrollingText.parentElement.clientWidth;

    // 애니메이션 지속 시간을 텍스트의 가로 길이에 따라 계산
    var animationDuration = (scrollingTextWidth / containerWidth) * 10;

    // 전체 텍스트에 애니메이션 시간을 적용
    scrollingText.style.animationDuration = animationDuration + 's';

    // 각 p태그에 animation-delay를 설정하여 애니메이션이 순차적으로 시작되도록 처리
    var paragraphs = document.querySelectorAll('.scrolling-text p');
    paragraphs.forEach((p, index) => {
        var delayTime = index * .3;  // 각 텍스트마다 0.5초씩 지연
        p.style.animationDelay = delayTime + 's';

        // 애니메이션 종료 후 visibility를 hidden으로 변경
        p.addEventListener('animationend', function() {
            p.style.visibility = 'hidden';  // 애니메이션 종료 후 숨기기
        });

        // 애니메이션이 시작될 때 다시 visible로 되돌리기
        p.addEventListener('animationstart', function() {
            p.style.visibility = 'visible'; // 애니메이션 시작 시 보이게 하기
        });
    });
});  
