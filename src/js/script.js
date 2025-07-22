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
  "Informaticien en intelligence artificielle et sciences des données,<br>avec une spécialisation appliquée à la santé",
  "Titulaire d'un Master en Informatique,<br>spécialisé en Data Science et Intelligence Artificielle",
  "Maîtrise des outils de modélisation IA,<br>analyse de données biomédicales et développement web",
  "Curiosité scientifique, rigueur technique,<br>engagement associatif fort et un sens de l'humain"
];

let i = 0;

setInterval(() => {
  const el = document.querySelector(".hero p");
  el.style.opacity = 0;
  setTimeout(() => {
    el.innerHTML = phrases[i % phrases.length];  // utiliser innerHTML pour interpréter les <br>
    el.style.opacity = 1;
    i++;
  }, 500);
},5000);
