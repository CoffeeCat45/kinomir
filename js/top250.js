const TOP_API_KEY = "c35fe2f8-21b9-4a26-9bcf-205ee2edbf03";

const list = document.querySelector(".top250__list");
const tabs = document.querySelectorAll(".top250__tab");
const search = document.querySelector(".top250__search");
const sort = document.querySelector(".top250__sort");
const pagination = document.querySelector(".top250__pagination");
const prev = document.querySelector(".top250__pagination-prev");
const next = document.querySelector(".top250__pagination-next");
const pageText = document.querySelector(".top250__page");

const CACHE_KEY = "kinomir_top250";
const CACHE_TIME_KEY = "kinomir_top250_time";
const CACHE_LIFE = 24 * 60 * 60 * 1000;

let movies = [];
let limit = 10;
let page = 1;
const perPage = 15;

async function loadMovies() {
    list.innerHTML = "<p>Загрузка фильмов...</p>";

    const cache = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cache && cacheTime && Date.now() - Number(cacheTime) < CACHE_LIFE) {
        const cachedMovies = JSON.parse(cache);
        if (cachedMovies.length >= 250 && cachedMovies[0].topPosition) {
            movies = cachedMovies;
            render();
            return;
        }
    }

    try {
        let allItems = [];

        for (let apiPage = 1; apiPage <= 13; apiPage++) {
            const response = await fetch(
                `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_250_MOVIES&page=${apiPage}`,
                {
                    headers: {
                        "X-API-KEY": TOP_API_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Ошибка загрузки фильмов");
            }

            const data = await response.json();
            allItems = allItems.concat(data.items);

            if (allItems.length >= 250) {
                break;
            }
        }

        movies = allItems.slice(0, 250).map(function (movie, index) {
            movie.topPosition = index + 1;
            return movie;
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(movies));
        localStorage.setItem(CACHE_TIME_KEY, Date.now());

        render();
    } catch (error) {
        list.innerHTML = "<p>Не удалось загрузить фильмы.</p>";
        console.error(error);
    }
}

function render() {
    let result = movies.slice(0, limit);

    const searchValue = search.value.toLowerCase().trim();
    if (searchValue) {
        result = result.filter(function (movie) {
            return (movie.nameRu || movie.nameEn || "")
                .toLowerCase()
                .includes(searchValue);
        });
    }

    if (sort.value === "year-new") {
        result.sort(function (a, b) {
            return Number(b.year) - Number(a.year);
        });
    }
    if (sort.value === "year-old") {
        result.sort(function (a, b) {
            return Number(a.year) - Number(b.year);
        });
    }

    const totalPages = Math.ceil(result.length / perPage);
    const start = (page - 1) * perPage;
    const currentMovies = result.slice(start, start + perPage);

    list.innerHTML = "";

    if (!currentMovies.length) {
        list.innerHTML = "<p>Фильмы не найдены.</p>";
        pagination.classList.add("hidden");
        return;
    }

    currentMovies.forEach(function (movie) {
        const card = document.createElement("article");
        card.className = movie.topPosition <= 3
            ? "top250-card top250-card--winner"
            : "top250-card";

        card.innerHTML = `
            <div class="top250-card__number">${movie.topPosition}</div>
            <img 
                class="top250-card__poster" 
                src="${movie.posterUrlPreview || ""}" 
                alt="${movie.nameRu || movie.nameEn || "Постер фильма"}"
            >
            <div class="top250-card__content">
                <h2 class="top250-card__title">
                    ${movie.nameRu || movie.nameEn || "Название неизвестно"}
                </h2>
                <p class="top250-card__genre">
                    ${movie.genres && movie.genres.length ? movie.genres[0].genre : "Жанр неизвестен"}
                </p>
                <p class="top250-card__duration">
                    ${movie.year || "Год неизвестен"}
                </p>
            </div>
            <div class="top250-card__rating">
                ${movie.ratingKinopoisk || "—"}
            </div>
            <a class="top250-card__button" href="movies.html?id=${movie.kinopoiskId}">Подробнее</a>
        `;

        list.append(card);
    });

    if (totalPages <= 1) {
        pagination.classList.add("hidden");
    } else {
        pagination.classList.remove("hidden");
        pageText.textContent = `${page} / ${totalPages}`;
        prev.disabled = page === 1;
        next.disabled = page === totalPages;
    }
}

tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        tabs.forEach(function (item) {
            item.classList.remove("active");
        });
        tab.classList.add("active");
        limit = Number(tab.dataset.limit);
        page = 1;
        render();
    });
});

search.addEventListener("input", function () {
    page = 1;
    render();
});

sort.addEventListener("change", function () {
    page = 1;
    render();
});

prev.addEventListener("click", function () {
    page--;
    render();
});

next.addEventListener("click", function () {
    page++;
    render();
});

loadMovies();