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
    if(value > 1200 && value < 1700){
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


// document.addEventListener("DOMContentLoaded", () => {
//     const description = document.getElementById("description");
//     const goToIndexButton = document.getElementById("go-to-index");

//     const content = `
// "오늘 하루, 영화처럼"은 단순한 여행 계획을 넘어, 당신의 일상을 영화와 드라마 속 주인공의 여정으로 
// 물들입니다. 촬영지 지도와 정보를 제공하여, 좋아하는 영화나 드라마의 장면 속 장소를 직접 걸으며,
// 마치 한 편의 이야기를 새롭게 써내려가는 경험을 선사합니다. 자신이 사랑했던 이야기의 주인공이 되어,
// 그들의 감정을 느끼고 그들의 발자취를 따라 특별한 하루를 만들어보세요. 당신의 여정이 영화처럼 아름다운 순간들로 가득 차길 바랍니다.
// `;

//     let i = 0;

//     function typeEffect() {
//         if (i < content.length) {
//             description.textContent += content[i];

//             // 띄어쓰기에서는 잠시 멈춤
//             const delay = content[i] === " " ? 100 : 50; // 띄어쓰기는 200ms, 나머지는 100ms
//             i++;
//             setTimeout(typeEffect, delay); // 다음 글자 출력
//         } else {
//             // 타이핑이 끝난 후 버튼 표시
//             goToIndexButton.classList.remove("hidden"); // hidden 클래스 제거
//         }
//     }

//     typeEffect(); // 타이핑 효과 시작
// });