// Affichage de l'annuaire. Les données des artisans sont dans artisans.js.

const TOUS = ""; // valeur de l'option « Tous » dans les listes déroulantes
const MESSAGE_WHATSAPP = "Bonjour, je vous ai trouvé sur Artisans de N'Djamena";

const champ = document.getElementById("champ-recherche");
const filtreMetier = document.getElementById("filtre-metier");
const filtreQuartier = document.getElementById("filtre-quartier");
const liste = document.getElementById("liste");
const compteur = document.getElementById("compteur");
const vide = document.getElementById("vide");
const modele = document.getElementById("modele-carte");

// Recherche insensible aux accents et aux majuscules : « electricien » trouve « Électricien ».
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Regroupe masculin et féminin sous un même filtre : « Couturière » → « Couturier ».
function metierDeBase(metier) {
  return metier.replace(/ière$/, "ier").replace(/ienne$/, "ien");
}

function initiales(nom) {
  return nom
    .split(" ")
    .slice(0, 2)
    .map((mot) => mot[0])
    .join("")
    .toUpperCase();
}

function creerCarte(artisan) {
  const carte = modele.content.firstElementChild.cloneNode(true);
  carte.querySelector(".avatar").textContent = initiales(artisan.nom);
  carte.querySelector(".carte__nom").textContent = artisan.nom;
  carte.querySelector(".carte__metier").textContent = artisan.metier;
  carte.querySelector(".carte__lieu").textContent = artisan.quartier;

  const noteTexte = artisan.note.toFixed(1).replace(".", ",");
  const note = carte.querySelector(".note");
  note.setAttribute("aria-label", "Note : " + noteTexte + " sur 5");
  note.querySelector(".etoiles").style.setProperty("--note", artisan.note);
  note.querySelector(".note__valeur").textContent = noteTexte + " / 5";

  const appel = carte.querySelector(".bouton--appel");
  appel.href = "tel:" + artisan.telephone.replace(/\s/g, "");
  appel.textContent = "Appeler le " + artisan.telephone;

  // wa.me attend le numéro international en chiffres seuls : « +235 60 00 00 01 » → « 23560000001 ».
  const whatsapp = carte.querySelector(".bouton--whatsapp");
  whatsapp.href = "https://wa.me/" + artisan.telephone.replace(/\D/g, "") +
    "?text=" + encodeURIComponent(MESSAGE_WHATSAPP);
  whatsapp.setAttribute("aria-label", "Contacter sur WhatsApp : " + artisan.nom);
  return carte;
}

function afficher() {
  const recherche = normaliser(champ.value.trim());
  const metier = filtreMetier.value;
  const quartier = filtreQuartier.value;

  const resultats = ARTISANS.filter((artisan) =>
    (metier === TOUS || metierDeBase(artisan.metier) === metier) &&
    (quartier === TOUS || artisan.quartier === quartier) &&
    normaliser(artisan.nom).includes(recherche)
  );

  liste.replaceChildren(...resultats.map(creerCarte));

  const n = resultats.length;
  compteur.textContent = n + (n > 1 ? " artisans trouvés" : " artisan trouvé");
  vide.hidden = n !== 0;
}

// Remplit une liste déroulante : « Tous » puis chaque valeur, triée par ordre alphabétique.
function remplir(select, valeurs, libelleTous) {
  const tries = [...new Set(valeurs)].sort((a, b) => a.localeCompare(b, "fr"));
  select.replaceChildren(
    new Option(libelleTous, TOUS),
    ...tries.map((valeur) => new Option(valeur, valeur))
  );
  select.addEventListener("change", afficher);
}

remplir(filtreMetier, ARTISANS.map((a) => metierDeBase(a.metier)), "Tous les métiers");
remplir(filtreQuartier, ARTISANS.map((a) => a.quartier), "Tous les quartiers");
champ.addEventListener("input", afficher);
afficher();
