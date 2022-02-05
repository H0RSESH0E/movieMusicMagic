var soundtrackContainerEl = document.querySelector('#soundtrack-container');
var bigContainer = document.querySelector("#main-container")
var artworkContainerEl = document.createElement("div");

var searchForm = document.createElement("form")
var inputField = document.createElement("input");
var submitButton = document.createElement("button")
submitButton.textContent = "SEARCH";

searchForm.appendChild(inputField);
searchForm.appendChild(submitButton);
bigContainer.appendChild(searchForm);
bigContainer.appendChild(artworkContainerEl);
var counter = 0;
// Variable Declarations
var spotifyToken;
var searchTerm;
var completed1 = false;
var completed2 = false;

// Local Storage Array 
var arrayToSaveInLocalStorage = [];
var objectToSaveEachSearch = {};

// This function captures the user search criteria and resets the input field
var formSubmitHandler = function (event) {
    event.preventDefault();

    searchTerm = inputField.value.trim();
    artworkContainerEl.textContent = '';
    inputField.value = '';

    if (searchTerm) {
        getSpotifyData(spotifyToken, searchTerm)
        getOmdbData(searchTerm);

    }
    else {
        // modal alert
    }
};


// This function sppends the dynamically created elemnents to the page
var displayOmdb = function (movieData) {
    console.log("You are here!")

    // Poster Art
    var posterEl = document.createElement("img");
    posterEl.setAttribute("src", movieData.Poster);
    objectToSaveEachSearch.poster = movieData.Poster;
    // Official Show Title
    var showTitleEl = document.createElement("h2");
    showTitleEl.textContent = movieData.Title;
    objectToSaveEachSearch.title = movieData.Title
    // Year
    var yearEl = document.createElement("h4");
    yearEl.textContent = movieData.Year;
    objectToSaveEachSearch.year = movieData.Year;
    // Ratings 
    var ratingsDiv = document.createElement("div");
    if (movieData.Ratings.length > 0) {
        for (var i = 0; i < movieData.Ratings.length; i++) {
            var ratingContainer = document.createElement("div");
            var individualRatingSourceEl = document.createElement("span")
            var individualRatingEl = document.createElement("span");

            individualRatingSourceEl.textContent = movieData.Ratings[i].Source;
            individualRatingEl.textContent = movieData.Ratings[i].Value;

            ratingContainer.appendChild(individualRatingSourceEl);
            ratingContainer.appendChild(individualRatingEl);

            ratingsDiv.appendChild(ratingContainer);
        }
    }
    else {
        var noRatings = document.createElement("span");
        noRatings.textContent = "Kelcie says there were no ratings"
    }

    // Website
    var websiteEl = document.createElement("a");
    if (movieData.Website !== "N/A") {
        websiteEl.setAttribute("href", movieData.Website);
        websiteEl.textContent = movieData.Website;
    }

    artworkContainerEl.appendChild(posterEl);
    artworkContainerEl.appendChild(showTitleEl);
    artworkContainerEl.appendChild(yearEl);
    artworkContainerEl.appendChild(ratingsDiv);
    artworkContainerEl.appendChild(websiteEl);






}

// This function fetches from the Open Movie Database and passes the data to the displayOmdb function
var getOmdbData = function (showName) {
    debugger;
    console.log(arrayToSaveInLocalStorage, "before OMDB FETCH");

    // format the github api url
    var apiUrl = `http://www.omdbapi.com/?apikey=eb60e924&t=${showName}`;

    // make a get request to url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                console.log(response);
                response.json().then(function (data) {
                    console.log(data);
                    displayOmdb(data);
                    completed1 = true;
                    counter = counter + 100;
                    if (completed1 && completed2) {
                        saveSearchResults();
                        console.log("OMDB WINS!!!!!!");
                        completed1 = false;
                    }
                });
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to OMDB');
        });



};

// This function will fetch from the Spotify API
var getSpotifyToken = function () {
    var clientId = "c0c739d14fa7455c845f2543a0bdd7a2";
    var clientSecret = "3892b03191084834a523304de30afb9f";

    var tokenApi = "https://accounts.spotify.com/api/token";

    fetch(tokenApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ":" + clientSecret)
        },
        body: 'grant_type=client_credentials'
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            spotifyToken = data.access_token;
            console.log(spotifyToken);
        });

};


var getSpotifyData = function (token, searchString) {
    console.log(arrayToSaveInLocalStorage, "at the beginning of SPOTIFY FETCH");

    var spotifyApiUrl = 'https://api.spotify.com/v1/search?q=' + searchString + ' Original%20Motion%20Picture&type=album';

    fetch(spotifyApiUrl, {
        method: 'GET',
        headers: { "Authorization": 'Bearer ' + token },

    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            var urlToPass = data.albums.items[0].external_urls.spotify;
            objectToSaveEachSearch.spotifyLink = urlToPass;
            var albumCover = data.albums.items[0].images[0].url;
            console.log("This is the first URL2PASS: ", urlToPass);
            displayFirstSearchResult(urlToPass, albumCover)
            completed2 = true;
            counter = counter + 10;
            if (completed1 && completed2) {
                console.log("SPOTIFY!!!!!!!!!!");
                saveSearchResults();
                completed2 = false;
            }

        });

}

var displayFirstSearchResult = function (urlToPass, albumCover) {
    console.log("THis is the 2nd: ", urlToPass);
    var urlToClick = document.createElement("a");
    urlToClick.textContent = urlToPass;
    urlToClick.setAttribute("href", urlToPass);
    urlToClick.setAttribute("target", "_blank");

    var albumCoverToClick = document.createElement("img");
    albumCoverToClick.src = albumCover;
    urlToClick.appendChild(albumCoverToClick);


    artworkContainerEl.appendChild(urlToClick);
}

// Save users search input and results into local storage
var saveSearchResults = function () {
    console.log(arrayToSaveInLocalStorage, "before");


    var y = objectToSaveEachSearch;
    var q = setTimeout(function(){
        arrayToSaveInLocalStorage.push(y);
        console.log(arrayToSaveInLocalStorage, "after");

    }, 3000)

    // localStorage.setItem("moviemusicmagic", JSON.stringify(storedSearch));
};

var loadSavedSearches = function () { }

    console.log(arrayToSaveInLocalStorage, "before ANTHYING");
getSpotifyToken();


// add event listeners to forms
searchForm.addEventListener('submit', formSubmitHandler);
