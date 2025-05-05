let version = '';
let championList = [];
let filteredChampions = [];
let currentChampion = null;

const getEl = id => document.getElementById(id);
const cardContainer = getEl("card-container");

async function fetchVersion() {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const data = await res.json();
  return data[0];
}

async function fetchChampionList(v) {
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/champion.json`);
  const data = await res.json();
  return Object.values(data.data);
}

async function fetchChampionDetails(id) {
  const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${id}.json`);
  const data = await res.json();
  return data.data[id];
}

function setBackgroundImage(url) {
  document.getElementById("page").style.backgroundImage = `url(${url})`;
}

function createCard(champion) {
  const { id, name, title, lore, tags } = champion;

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <img class="portrait" src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg" />
        <div class="top-icons">
          ${tags.map(tag => `<img src="https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-details/global/default/role-icon-${tag.toLowerCase()}.png" alt="${tag}" />`).join("")}
        </div>
        <div class="card-footer">
          <h2>${name}</h2>
          <p>${title}</p>
        </div>
      </div>
      <div class="card-back">
        <h2>${name}</h2>
        <p><em>${title}</em></p>
        <p>${lore}</p>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });

  return card;
}

function renderChampion(champion) {
  cardContainer.innerHTML = "";
  cardContainer.appendChild(createCard(champion));
  setBackgroundImage(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`);
}

async function showRandomChampion() {
  const pool = filteredChampions.length ? filteredChampions : championList;
  const champ = pool[Math.floor(Math.random() * pool.length)];
  const full = await fetchChampionDetails(champ.id);
  renderChampion(full);
  currentChampion = full;
}

function populateSearchList(list) {
  const datalist = getEl("championList");
  datalist.innerHTML = "";
  list.forEach(c => {
    const option = document.createElement("option");
    option.value = c.name;
    datalist.appendChild(option);
  });
}

getEl("randomBtn").addEventListener("click", showRandomChampion);

getEl("searchInput").addEventListener("input", async (e) => {
  const name = e.target.value.toLowerCase();

  if (name.trim() === "") {
    if (filteredChampions.length > 0) {
      cardContainer.innerHTML = "";
      for (const champ of filteredChampions) {
        const full = await fetchChampionDetails(champ.id);
        cardContainer.appendChild(createCard(full));
      }
      setBackgroundImage("https://raw.communitydragon.org/latest/game/assets/ux/loadingscreen/srbackground.png");
    } else {
      showRandomChampion();
    }
    return;
  }

  const match = championList.find(c => c.name.toLowerCase() === name);
  if (match) {
    const full = await fetchChampionDetails(match.id);
    renderChampion(full);
    currentChampion = full;
  }
});

getEl("roleFilter").addEventListener("change", async (e) => {
  const role = e.target.value;

  if (!role) {
    filteredChampions = [];
    populateSearchList(championList);
    showRandomChampion();
    return;
  }

  filteredChampions = championList.filter(c => c.tags.includes(role));
  populateSearchList(filteredChampions);
  
  cardContainer.innerHTML = "";
  for (const champ of filteredChampions) {
    const full = await fetchChampionDetails(champ.id);
    const card = createCard(full);
    cardContainer.appendChild(card);
  }

  setBackgroundImage("https://raw.communitydragon.org/latest/game/assets/ux/loadingscreen/srbackground.png");
});

getEl("searchToggleBtn").addEventListener("click", () => {
  const input = getEl("searchInput");
  input.style.display = input.style.display === "none" ? "inline-block" : "none";
  if (input.style.display !== "none") {
    input.focus();
  }
});


async function init() {
  version = await fetchVersion();
  championList = await fetchChampionList(version);
  populateSearchList(championList);
  showRandomChampion();
}

init();
