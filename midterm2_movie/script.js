const API_KEY = 'api_key=e58141c5002f16f6a2538f962c0d72f0';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?' + API_KEY;
const form = document.getElementById('form');
const search = document.getElementById('search');
const startbutton = document.getElementById('start-button');
const layout = document.getElementById('layout');
const startScreen = document.getElementById('start-screen');
const main = document.getElementById('main');
const genre = document.getElementById('genre');

const genres = [
  {
    "id": 28,
    "name": "Action"
  },
  {
    "id": 12,
    "name": "Adventure"
  },
  {
    "id": 16,
    "name": "Animation"
  },
  {
    "id": 35,
    "name": "Comedy"
  },
  {
    "id": 80,
    "name": "Crime"
  },
  {
    "id": 99,
    "name": "Documentary"
  },
  {
    "id": 18,
    "name": "Drama"
  },
  {
    "id": 10751,
    "name": "Family"
  },
  {
    "id": 14,
    "name": "Fantasy"
  },
  {
    "id": 36,
    "name": "History"
  },
  {
    "id": 27,
    "name": "Horror"
  },
  {
    "id": 10402,
    "name": "Music"
  },
  {
    "id": 9648,
    "name": "Mystery"
  },
  {
    "id": 10749,
    "name": "Romance"
  },
  {
    "id": 878,
    "name": "Science Fiction"
  },
  {
    "id": 10770,
    "name": "TV Movie"
  },
  {
    "id": 53,
    "name": "Thriller"
  },
  {
    "id": 10752,
    "name": "War"
  },
  {
    "id": 37,
    "name": "Western"
  }
];

// Add a new div to show suggestions
const suggestionsDiv = document.createElement('div');
suggestionsDiv.setAttribute('id', 'suggestions');
suggestionsDiv.classList.add('hidden'); // Initially hidden
form.appendChild(suggestionsDiv);

startbutton.addEventListener('click', starting);


function starting() {
  startScreen.classList.add('hidden');
  layout.classList.remove('hidden');
}

getMovies(API_URL);

function getMovies(url) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      showMovies(data.results);
    });
}

function showMovies(data) {
  main.innerHTML = '';
  data.forEach(movie => {
    const { title, poster_path, vote_average, overview } = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <img src="${IMG_URL + poster_path}" alt="${title || 'No title available'}">
      <div class="movie-info">
          <h3>${title || 'No title available'}</h3>
          <span class="${getColor(vote_average)}">${vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
      </div>
      <div class="overview">
        ${overview || 'No overview available'}
      </div>
    `;
    main.appendChild(movieEl);
  });
}

function getColor(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

// Fetch movie suggestions based on the input
search.addEventListener('input', async () => {
  const query = search.value;
  if (query.length > 2) {
    const response = await fetch(`${BASE_URL}/search/movie?${API_KEY}&query=${query}`);
    const data = await response.json();
    displaySuggestions(data.results);
  } else {
    suggestionsDiv.classList.add('hidden');
  }
});

// Display suggestions in the dropdown
function displaySuggestions(movies) {
  suggestionsDiv.innerHTML = ''; // Clear previous suggestions
  if (movies.length === 0) {
    suggestionsDiv.classList.add('hidden');
    return;
  }
  movies.slice(0, 5).forEach(movie => { // Show top 5 suggestions
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion-item');
    suggestion.textContent = `${movie.title}` || 'No title available'; // Set title text or fallback
    suggestion.addEventListener('click', () => {
      search.value = movie.title || ''; // Set input to selected movie, fallback if missing
      suggestionsDiv.classList.add('hidden');
      getMovies(`${BASE_URL}/search/movie?query=${movie.title}&${API_KEY}`); // Search for selected movie
    });
    suggestionsDiv.appendChild(suggestion);
  });
  suggestionsDiv.classList.remove('hidden'); // Show suggestions dropdown
}

// Hide suggestions when clicking outside the input field
document.addEventListener('click', (e) => {
  if (!form.contains(e.target)) {
    suggestionsDiv.classList.add('hidden');
  }
});

// Handle form submission for full search
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm) {
    getMovies(`${BASE_URL}/search/movie?query=${searchTerm}&${API_KEY}`);
  } else {
    getMovies(API_URL);
  }
});

setGenre();
var selectedGenres = [];

genre.addEventListener(setGenre);
function setGenre(){
    genre.innerHTML = '';
    genres.forEach(genres=>{
      const t = document.createElement('div');
      t.classList.add('filter');
      t.id = genres.id;
      t.innerText = genres.name; 
      t.addEventListener('click', () => {
        if(selectedGenres.length == 0){
          selectedGenres.push(genre.id);
        } 
        else{
          if(selectedGenres.includes(genre.id)){
            selectedGenres.forEach((id, idx) => {
              if(id== genre.id){
                selectedGenres.splice(idx, 1);
              }
            })
          }else{
            selectedGenres.push(genre.id);
          }
        }
        console.log(selectedGenres);
        getMovies(API_URL + '&with_genres='+ encodeURI(selectedGenres.join(',')));
      })
      genre.append(t);
    })
}


