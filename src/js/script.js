document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
    target.scrollIntoView({ behavior: "smooth" });
    }
});
});

const phrases = [
"Informaticien IA & Santé",
"Spécialiste Data Science biomédicale",
"Passionné par l'innovation médicale"
];
let i = 0;

setInterval(() => {
const el = document.querySelector(".hero p");
el.style.opacity = 0;
setTimeout(() => {
    el.textContent = phrases[i % phrases.length];
    el.style.opacity = 1;
    i++;
}, 500);
}, 3000);