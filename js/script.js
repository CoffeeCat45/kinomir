const moviesList = document.querySelector(".movies__list");
const loadMoreBtn = document.querySelector(".movies__loadmore-button");

let allMovies = [];
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadMovies(page = 1) {
    if (isLoading) return;
    isLoading = true;
    if (page === 1 && moviesList) moviesList.innerHTML = "<p>Загрузка фильмов...</p>";
    try {
        const res = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=${page}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": APP_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!res.ok) throw new Error("Ошибка загрузки");
        const data = await res.json();
        totalPages = data.totalPages || totalPages;
        const newMovies = data.items.slice(0, 12);
        allMovies = allMovies.concat(newMovies);
        if (moviesList) renderMovies(newMovies);
        if (loadMoreBtn && page >= totalPages) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = "Больше фильмов нет";
        }
    } catch (err) {
        if (moviesList) moviesList.innerHTML = "<p>Не удалось загрузить фильмы.</p>";
        console.error(err);
    } finally {
        isLoading = false;
    }
}

function renderMovies(movies) {
    if (!moviesList) return;
    if (moviesList.innerHTML === "<p>Загрузка фильмов...</p>" || moviesList.innerHTML === "<p>Не удалось загрузить фильмы.</p>") {
        moviesList.innerHTML = "";
    }
    movies.forEach(movie => {
        const card = document.createElement("article");
        card.classList.add("movie-card");
        card.innerHTML = `
            <img class="movie-card__poster" src="${movie.posterUrlPreview || ""}" alt="${movie.nameRu || movie.nameEn || "Постер"}">
            <div class="movie-card__content">
                <h3 class="movie-card__title">${movie.nameRu || movie.nameEn || "Название неизвестно"}</h3>
                <div class="movie-card__bottom">
                    <span class="movie-card__year">${movie.year || "—"}</span>
                    <span class="movie-card__rating">${movie.ratingKinopoisk || "—"}</span>
                </div>
                <a class="movie-card__button" href="movies.html?id=${movie.kinopoiskId}">Подробнее</a>
            </div>
        `;
        moviesList.appendChild(card);
    });
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        if (currentPage < totalPages && !isLoading) {
            currentPage++;
            loadMovies(currentPage);
        }
    });
}

const form = document.getElementById("subscribeForm");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("email");
        if (!emailInput) return;
        const email = emailInput.value.trim();
        if (!email) {
            alert("Введите email");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            alert("Введите корректный email");
            return;
        }
        console.log("Подписка:", email);
        alert(`Спасибо, ${email}!`);
        form.reset();
    });
}

const burger = document.querySelector(".header__burger");
const mobileMenu = document.querySelector(".header__mobile-menu");
if (burger && mobileMenu) {
    burger.addEventListener("click", () => mobileMenu.classList.toggle("active"));
}

document.querySelectorAll(".js-scroll").forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        }
    });
});

if (moviesList) loadMovies(1);