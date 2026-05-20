const premiersList = document.querySelector(".premiers__list");
const loadMoreBtn = document.querySelector(".premiers__loadmore-button");

let currentYear = new Date().getFullYear();
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

function generateYearTabs() {
    const currentYearNow = new Date().getFullYear();
    const yearTabsContainer = document.querySelector(".premiers__year-tabs");
    if (!yearTabsContainer) return;
    yearTabsContainer.innerHTML = "";
    const startYear = currentYearNow - 5;
    for (let year = startYear; year <= currentYearNow; year++) {
        const button = document.createElement("button");
        button.className = "premiers__year-tab";
        if (year === currentYearNow) button.classList.add("active");
        button.setAttribute("data-year", year);
        button.textContent = year;
        button.addEventListener("click", () => {
            document.querySelectorAll(".premiers__year-tab").forEach(t => t.classList.remove("active"));
            button.classList.add("active");
            switchYear(year);
        });
        yearTabsContainer.appendChild(button);
    }
    return currentYearNow;
}

async function loadMoviesByYear(year, page = 1, resetList = true) {
    if (isLoading) return;
    isLoading = true;
    if (resetList && page === 1) {
        premiersList.innerHTML = "<p>Загрузка фильмов...</p>";
    }
    try {
        const response = await fetch(
            `https://kinopoiskapiunofficial.tech/api/v2.2/films?yearFrom=${year}&yearTo=${year}&page=${page}`,
            {
                method: "GET",
                headers: {
                    "X-API-KEY": APP_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
        const data = await response.json();
        totalPages = data.totalPages || 1;
        let items = data.items || [];
        if (resetList && page === 1) {
            premiersList.innerHTML = "";
            currentPage = 1;
        }
        if (items.length === 0 && page === 1) {
            premiersList.innerHTML = "<p>Фильмов за этот год не найдено.</p>";
            loadMoreBtn.style.display = "none";
            return;
        }
        renderMovies(items);
        if (page >= totalPages) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = "Больше фильмов нет";
        } else {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = "Загрузить ещё";
        }
        loadMoreBtn.style.display = "flex";
    } catch (error) {
        console.error(error);
        if (resetList && page === 1) {
            premiersList.innerHTML = "<p>Не удалось загрузить фильмы. Попробуйте позже.</p>";
        }
        loadMoreBtn.style.display = "none";
    } finally {
        isLoading = false;
    }
}

function renderMovies(movies) {
    movies.forEach(movie => {
        const card = document.createElement("article");
        card.classList.add("movie-card");
        const posterUrl = movie.posterUrlPreview || movie.posterUrl || "";
        const title = movie.nameRu || movie.nameEn || movie.originalName || "Название неизвестно";
        const year = movie.year || "—";
        const rating = movie.ratingKinopoisk || "—";
        const kinopoiskId = movie.kinopoiskId;
        card.innerHTML = `
            <img class="movie-card__poster" src="${posterUrl}" alt="${escapeHtml(title)}" 
                 onerror="this.style.display='none'; this.parentElement.classList.add('no-poster')">
            <div class="movie-card__content">
                <h3 class="movie-card__title">${escapeHtml(title)}</h3>
                <div class="movie-card__bottom">
                    <span class="movie-card__year">${year}</span>
                    <span class="movie-card__rating">${rating}</span>
                </div>
                <a class="movie-card__button" href="movies.html?id=${kinopoiskId}">Подробнее</a>
            </div>
        `;
        premiersList.appendChild(card);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function switchYear(year) {
    currentYear = year;
    currentPage = 1;
    loadMoviesByYear(currentYear, 1, true);
}

loadMoreBtn.addEventListener("click", () => {
    if (currentPage < totalPages && !isLoading) {
        currentPage++;
        loadMoviesByYear(currentYear, currentPage, false);
    }
});

// Генерируем вкладки и устанавливаем текущий год
const generatedYear = generateYearTabs();
if (generatedYear) currentYear = generatedYear;
loadMoviesByYear(currentYear, 1, true);