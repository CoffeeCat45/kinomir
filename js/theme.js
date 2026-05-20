const themeButton = document.querySelector(".header__theme-button");
const THEME_KEY = "kinomir_theme";
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}
if (themeButton) {
    themeButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-theme");
        const isDarkTheme = document.body.classList.contains("dark-theme");
        if (isDarkTheme) {
            localStorage.setItem(THEME_KEY, "dark");
        } else {
            localStorage.setItem(THEME_KEY, "light");
        }
    });
}