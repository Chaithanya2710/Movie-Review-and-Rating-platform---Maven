document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "ca1999a7"; // your OMDB API key
    const searchBtn = document.getElementById("searchBtn");
    const movieInput = document.getElementById("movieInput");
    const movieContainer = document.getElementById("movieContainer");
    const allReviewsBtnGlobal = document.getElementById("allReviewsBtnGlobal");
    const heroSection = document.getElementById("heroSection");

    // --- SEARCH MOVIE ---
    searchBtn.addEventListener("click", fetchMovie);

    async function fetchMovie() {
        const movieName = movieInput.value.trim();
        if (!movieName) return alert("Enter a movie name!");
        try {
            const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${apiKey}`);
            const data = await res.json();
            if (data.Response === "False") {
                movieContainer.innerHTML = "<p>Movie not found 😞</p>";
                return;
            }
            showMovie(data);
        } catch (err) {
            console.error(err);
            alert("Error fetching movie");
        }
    }

    // --- SHOW MOVIE DETAILS ---
    function showMovie(movie) {
        heroSection.style.display = "none"; // hide hero

        movieContainer.innerHTML = `
            <div class="movie-card">
                <img src="${movie.Poster}" alt="${movie.Title}" />
                <h2>${movie.Title}</h2>
                <p>⭐ IMDb: ${movie.imdbRating}</p>

                <div id="starRating">${[1,2,3,4,5].map(i=>`<span data-star="${i}">&#9733;</span>`).join('')}</div>

                <textarea id="reviewInput" placeholder="Write your review..."></textarea>
                <button class="review-btn" id="submitReview">Add Review</button>
                <button class="review-btn" id="backBtn">Back to Search</button>
                <button class="review-btn" id="allReviewsBtn">View Reviews</button>
            </div>
        `;

        // star rating
        let selectedRating = 0;
        document.querySelectorAll("#starRating span").forEach(star => {
            star.style.color = "#555";
            star.addEventListener("click", () => {
                selectedRating = star.dataset.star;
                document.querySelectorAll("#starRating span").forEach(s =>
                    s.style.color = s.dataset.star <= selectedRating ? "gold" : "#555"
                );
            });
        });

        // add review
        document.getElementById("submitReview").addEventListener("click", () => {
            const text = document.getElementById("reviewInput").value.trim();
            if (!text || selectedRating == 0) {
                alert("Select rating & write review!");
                return;
            }
            addReview(movie.Title, text, selectedRating);
            alert("Review saved ✅");
        });

        // back button
        document.getElementById("backBtn").addEventListener("click", () => {
            movieContainer.innerHTML = "";
            heroSection.style.display = "flex";
            movieInput.value = "";
        });

        // view reviews page
        document.getElementById("allReviewsBtn").addEventListener("click", () => {
            showReviewsPage(movie.Title);
        });
    }

    // --- REVIEW STORAGE ---
    function getReviews(title) {
        const stored = localStorage.getItem(title);
        return stored ? JSON.parse(stored) : [];
    }

    function addReview(title, text, rating) {
        const reviews = getReviews(title);
        reviews.push({ text, rating });
        localStorage.setItem(title, JSON.stringify(reviews));
    }

    // --- SHOW REVIEWS PAGE FOR ONE MOVIE ---
    // --- SHOW REVIEWS PAGE FOR ONE MOVIE ---
function showReviewsPage(title) {
    const reviews = getReviews(title);
    movieContainer.innerHTML = `
        <div class="movie-card">
            <h2>Reviews for ${title}</h2>
            ${reviews.length > 0 ? reviews.map(r => `
                <div class="review-item">
                    ${"⭐".repeat(r.rating)} - ${r.text}
                </div>
            `).join("") : "<p>No reviews yet.</p>"}
            <button class="review-btn" id="backToMovie">Back</button>
        </div>
    `;

    document.getElementById("backToMovie").addEventListener("click", () => {
        fetchMovieByTitle(title);
    });
}


    // --- FETCH MOVIE BY TITLE ---
    async function fetchMovieByTitle(title) {
        const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
        const data = await res.json();
        if (data.Response === "True") showMovie(data);
    }

    // --- GLOBAL ALL REVIEWS PAGE ---
    // --- GLOBAL ALL REVIEWS PAGE ---
allReviewsBtnGlobal.addEventListener("click", () => {
    heroSection.style.display = "none";
    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
        movieContainer.innerHTML = "<p>No reviews available yet!</p>";
        return;
    }

    let allReviewsHTML = `
        <div class="all-reviews">
            <h2 class="all-reviews-title">⭐ All Reviews</h2>
            <div class="reviews-grid">
    `;

    keys.forEach(title => {
        const reviews = JSON.parse(localStorage.getItem(title));
        allReviewsHTML += `
            <div class="review-card">
                <h3>${title}</h3>
                <div class="review-list">
                    ${reviews.map(r => `
                        <div class="review-line">
                            <span class="star">⭐</span>
                            <span>${r.rating} - ${r.text}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    });

    allReviewsHTML += `
            </div>
            <div style="text-align:center; margin-top:30px;">
                <button class="review-btn" id="backFromAllReviews">Back</button>
            </div>
        </div>
    `;

    movieContainer.innerHTML = allReviewsHTML;

    document.getElementById("backFromAllReviews").addEventListener("click", () => {
        movieContainer.innerHTML = "";
        heroSection.style.display = "flex";
    });
});


    // --- EDIT / DELETE REVIEWS (exposed globally) ---
    window.editReview = function(title, index) {
        const reviews = getReviews(title);
        const newText = prompt("Edit review:", reviews[index].text);
        const newRating = prompt("Edit rating 1-5:", reviews[index].rating);
        if (newText && newRating >= 1 && newRating <= 5) {
            reviews[index] = { text: newText, rating: parseInt(newRating) };
            localStorage.setItem(title, JSON.stringify(reviews));
            showReviewsPage(title);
        }
    }

    window.deleteReview = function(title, index) {
        const reviews = getReviews(title);
        reviews.splice(index, 1);
        if (reviews.length === 0) localStorage.removeItem(title);
        else localStorage.setItem(title, JSON.stringify(reviews));
        showReviewsPage(title);
    }
});
