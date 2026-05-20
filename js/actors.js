const params = new URLSearchParams(window.location.search);
const filmId = params.get("filmId");
const actorId = params.get("actorId");

const actorsList = document.querySelector(".actors__list");
const actorCardTemplate = document.querySelector(".actor-card--template").cloneNode(true);
const searchInput = document.querySelector(".actors__search-input");
const modal = document.querySelector(".actor-modal");
const modalContent = document.querySelector(".actor-modal__content");
const modalTemplate = document.querySelector(".actor-modal__template").cloneNode(true);
const modalClose = document.querySelector(".actor-modal__close");
const historyList = document.querySelector(".actors__history-list");
const actorsPrevButton = document.querySelector(".actors__pagination-prev");
const actorsNextButton = document.querySelector(".actors__pagination-next");
const actorsPageText = document.querySelector(".actors__pagination-page");

const HISTORY_KEY = "kinomir_actors_history";
let actors = [];
let filteredActors = [];
let actorsPage = 1;
const actorsPerPage = 12;

async function loadActors() {
    if (!filmId) {
        actorsList.innerHTML = "<p>Фильм не выбран.</p>";
        return;
    }
    actorsList.innerHTML = "<p>Загрузка актеров...</p>";
    try {
        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=${filmId}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": APP_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) throw new Error("Ошибка API: " + response.status);
        const data = await response.json();
        actors = data.filter(person => person.professionKey === "ACTOR");
        filteredActors = [];
        actorsPage = 1;
        showActors();
        if (actorId) showActorInfo(actorId);
    } catch (error) {
        actorsList.innerHTML = "<p>Не удалось загрузить актеров.</p>";
        console.error(error);
    }
}

function showActors() {
    actorsList.innerHTML = "";
    const searchValue = searchInput.value.trim();
    const list = searchValue ? filteredActors : actors;
    if (list.length === 0) {
        actorsList.innerHTML = "<p>Актеры не найдены.</p>";
        actorsPageText.textContent = "1";
        actorsPrevButton.disabled = true;
        actorsNextButton.disabled = true;
        return;
    }
    const start = (actorsPage - 1) * actorsPerPage;
    const end = start + actorsPerPage;
    const actorsPageItems = list.slice(start, end);
    actorsPageItems.forEach(actor => {
        const card = actorCardTemplate.cloneNode(true);
        card.classList.remove("actor-card--template");
        const name = actor.nameRu || actor.nameEn || "Имя неизвестно";
        const photo = actor.posterUrl || "";
        const img = card.querySelector(".actor-card__photo");
        if (photo) {
            img.src = photo;
            img.alt = name;
            img.style.display = "block";
        } else {
            img.style.display = "none";
        }
        card.querySelector(".actor-card__name").textContent = name;
        card.querySelector(".actor-card__button").dataset.id = actor.staffId;
        actorsList.append(card);
    });
    actorsPageText.textContent = actorsPage;
    actorsPrevButton.disabled = actorsPage === 1;
    actorsNextButton.disabled = end >= list.length;
}

async function showActorInfo(id) {
    modal.classList.add("active");
    try {
        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v1/staff/${id}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": APP_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) throw new Error("Ошибка API: " + response.status);
        const actor = await response.json();
        const oldInfo = modalContent.querySelector(".actor-modal__info:not(.actor-modal__template)");
        if (oldInfo) oldInfo.remove();
        const info = modalTemplate.cloneNode(true);
        info.classList.remove("actor-modal__template");
        const name = actor.nameRu || actor.nameEn || "Имя неизвестно";
        const photo = actor.posterUrl || "";
        const birthday = actor.birthday || "Нет данных";
        const birthplace = actor.birthplace || "Нет данных";
        const facts = actor.facts && actor.facts.length > 0 ? actor.facts.join(" ") : "Биография отсутствует";
        const img = info.querySelector(".actor-modal__photo");
        if (photo) {
            img.src = photo;
            img.alt = name;
            img.style.display = "block";
        } else {
            img.style.display = "none";
        }
        info.querySelector(".actor-modal__name").textContent = name;
        info.querySelector(".actor-modal__birthday").textContent = birthday;
        info.querySelector(".actor-modal__birthplace").textContent = birthplace;
        info.querySelector(".actor-modal__facts").textContent = facts;
        const filmsList = info.querySelector(".actor-modal__films");
        filmsList.innerHTML = "";
        if (actor.films && actor.films.length > 0) {
            actor.films.slice(0, 10).forEach(film => {
                const li = document.createElement("li");
                const link = document.createElement("a");
                link.textContent = film.nameRu || film.nameEn || "Название неизвестно";
                link.href = `movies.html?id=${film.filmId}`;
                link.target = "_self";
                li.appendChild(link);
                filmsList.append(li);
            });
        } else {
            filmsList.innerHTML = "<li>Фильмография отсутствует</li>";
        }
        modalContent.append(info);
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        const historyActor = { id: actor.personId, name: name, photo: photo };
        history = history.filter(item => item.id !== historyActor.id);
        history.unshift(historyActor);
        history = history.slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        showHistory();
    } catch (error) {
        console.error(error);
    }
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyList.innerHTML = "";
    if (history.length === 0) {
        historyList.innerHTML = "<p>История пока пустая.</p>";
        return;
    }
    history.forEach(actor => {
        const cardHtml = `
            <button class="actors__history-card" type="button" data-id="${actor.id}">
                ${actor.photo ? `<img src="${actor.photo}" alt="${actor.name}">` : ""}
                <span>${actor.name}</span>
            </button>
        `;
        historyList.insertAdjacentHTML("beforeend", cardHtml);
    });
}

searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase().trim();
    filteredActors = value === "" ? [] : actors.filter(actor => (actor.nameRu || actor.nameEn || "").toLowerCase().includes(value));
    actorsPage = 1;
    showActors();
});

actorsList.addEventListener("click", event => {
    if (event.target.classList.contains("actor-card__button")) {
        showActorInfo(event.target.dataset.id);
    }
});

historyList.addEventListener("click", event => {
    const card = event.target.closest(".actors__history-card");
    if (card) showActorInfo(card.dataset.id);
});

actorsPrevButton.addEventListener("click", () => {
    if (actorsPage > 1) {
        actorsPage--;
        showActors();
    }
});

actorsNextButton.addEventListener("click", () => {
    const list = searchInput.value.trim() ? filteredActors : actors;
    if (actorsPage * actorsPerPage < list.length) {
        actorsPage++;
        showActors();
    }
});

modalClose.addEventListener("click", () => modal.classList.remove("active"));
modal.addEventListener("click", event => { if (event.target === modal) modal.classList.remove("active"); });

loadActors();
showHistory();