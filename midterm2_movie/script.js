const apiKey = 'e58141c5002f16f6a2538f962c0d72f0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchInput = document.getElementById('search-input');
const suggestionsDiv = document.getElementById('suggestions');
const moviesGrid = document.getElementById('movies-grid');
const sortSelect = document.getElementById('sort-select');
const watchlistGrid = document.getElementById('watchlist-grid');
const genreContainer = document.getElementById('genre-container');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const current = document.getElementById('current');


let selectedGenres = [];    
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

//для поисковика. Проверят есть ли в инпут что то, если есть то соединяется для запроса с базой данных и отправляет данные в дисплей
searchInput.addEventListener('input', async () => {
  const query = searchInput.value;
  if (query.length > 2) {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${apiKey}&query=${query}`);
    const data = await response.json();
    displaySuggestions(data.results);
  } else {
    suggestionsDiv.classList.add('hidden');
  }
});


//тут он получает данные с базы данных
async function getMovies(url, page = 1) {
    const response = await fetch(`${url}&page=${page}`);
    const data = await response.json();
    currentPage = data.page;       
    totalPages = data.total_pages; 
    lastUrl = `${url}&page=${page}`;  
    currentPage = data.totalPages;
    displayMovies(data.results);
    updatePaginationControls();
  }
//здесь я пытался сделать page changing
  function updatePaginationControls() {
    prevButton.classList.toggle('disabled', currentPage === 1);
    nextButton.classList.toggle('disabled', currentPage === totalPages);
    current.textContent = currentPage;
}



//тут он показывает топ 5 предложений по данному запросу и при нажатии на одну из них запускается показ самих фильмов
function displaySuggestions(movies) {
  suggestionsDiv.innerHTML = '';
  movies.slice(0, 5).forEach(movie => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion-item');
    suggestion.textContent = movie.title;
    suggestion.addEventListener('click', () => {
      searchInput.value = movie.title;
      suggestionsDiv.classList.add('hidden');
      getMovies(`${BASE_URL}/search/movie?api_key=${apiKey}&query=${movie.title}`);
    });
    suggestionsDiv.appendChild(suggestion);
  });
  suggestionsDiv.classList.remove('hidden');
}

//продолжение pagination
function pageCall(page){
    let urlSplit = lastUrl.split('?');
    let queryParams = urlSplit[1].split('&');
    let key = queryParams[queryParams.length-1].split('=');
    if(key[0] != 'page'){
        let url = lastUrl + '&page='+page
        getMovies(url);
    }   
}

//здесь он создает в html классы и айди каждому фильму и показывает ее по данному запросу
function displayMovies(movies) {
  moviesGrid.innerHTML = '';
  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    
    const movieInner = document.createElement('div');
    movieInner.classList.add('movie-inner');
    
    const movieFront = document.createElement('div');
    movieFront.classList.add('movie-front');
    movieFront.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    `;
    
    //задняя часть карточки. Данные по типу рейтинг, название, описание. 
    const movieBack = document.createElement('div');
    movieBack.classList.add('movie-back');
    movieBack.innerHTML = `
      <h3>${movie.title}</h3>
      <p>Rating: ${movie.vote_average.toFixed(1)}</p>
      <p id="overview">${movie.overview}</p>
      <button onclick="event.stopPropagation(); addToWatchlist(${movie.id})">Add to Favorites</button>
    `;

    movieInner.addEventListener('click', () => {
      movieCard.classList.toggle('flipped');
    });
    
    movieInner.appendChild(movieFront);
    movieInner.appendChild(movieBack);
    movieCard.appendChild(movieInner);
    moviesGrid.appendChild(movieCard);
  });
}


//добавить в избранные
function addToWatchlist(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${apiKey}`)
    .then(response => response.json())
    .then(movie => {
      if (!watchlist.some(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        alert(`${movie.title} has been added to your watchlist.`);
        displayWatchlist();
      } else {
        alert(`${movie.title} is already in your watchlist.`);
      }
    });
}

// показвыает избранные обьекты
function displayWatchlist() {
  watchlistGrid.innerHTML = '';
  watchlist.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Release Date: ${movie.release_date}</p>
    `;
    watchlistGrid.appendChild(movieCard);
  });
}


//сортировка по каждой категории
sortSelect.addEventListener('change', () => {
  const sortBy = sortSelect.value;
  getMovies(`${BASE_URL}/discover/movie?sort_by=${sortBy}&api_key=${apiKey}`);
});

//начальная загрузка страницы
getMovies(`${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${apiKey}`);
displayWatchlist();

//категории фильмов взятая из данного нам источника
const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
  ];


  //
  function setGenres() {
    genreContainer.innerHTML = '';
    genres.forEach(genre => {
      const genreButton = document.createElement('button');
      genreButton.classList.add('genre-button');
      genreButton.innerText = genre.name;
      genreButton.onclick = () => toggleGenre(genre.id);
      genreContainer.appendChild(genreButton);
    });
  }
  

  
  function toggleGenre(genreId) {
    if (selectedGenres.includes(genreId)) {
      selectedGenres = selectedGenres.filter(id => id !== genreId);
      
    } else {
      selectedGenres.push(genreId); 
    }
    getMovies(`${BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${selectedGenres.join(',')}`);
  }


  //отправить запрос при нажатии на энтер
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      searchMovies();
    }
  });
  

  //поиск фильма по запросу
  function searchMovies() {
    const query = searchInput.value;
    if (query) {
      getMovies(`${BASE_URL}/search/movie?api_key=${apiKey}&query=${query}`);
    }
  }
  


  async function getMovies(url) {
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
  }
  
 
  getMovies(`${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${apiKey}`);
  displayWatchlist();
  setGenres(); 


//попытка сделать pagination
  function updatePaginationControls() {
    paginationContainer.innerHTML = '';
  
    const prevButton = document.createElement('div');
    prevButton.classList.add('page');
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => {
      if (currentPage > 1) {
        getMovies(lastUrl, currentPage - 1);
      }
    };
    if (currentPage === 1) prevButton.classList.add('disabled');
  
    const nextButton = document.createElement('div');
    nextButton.classList.add('page');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => {
      if (currentPage < totalPages) {
        getMovies(lastUrl, currentPage +     1);
      }
    };
    if (currentPage === totalPages) nextButton.classList.add('disabled');
  
    paginationContainer.appendChild(prevButton);
  
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('div');
      pageButton.classList.add('page');
      pageButton.textContent = i;
      if (i === currentPage) pageButton.classList.add('current');
      pageButton.onclick = () => {
        if (i !== currentPage) {
          getMovies(lastUrl, i);
        }
      };
      paginationContainer.appendChild(pageButton);
    }
  
    paginationContainer.appendChild(nextButton);
  }


  movieInner.addEventListener('click', () => {
    movieCard.classList.toggle('flipped');
  });
  
 

  next
