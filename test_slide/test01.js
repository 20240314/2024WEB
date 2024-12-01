let maintext = document.querySelector("h1")
window.addEventListener("scroll", function(){
    let value = window.scrollY;
    if(value > 200){
        maintext.style.animation = "disappear 1s ease-out forwards"; 
    } else {
        maintext.style.animation = "slide 1s ease-out ";
    }
});