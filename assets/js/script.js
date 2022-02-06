// DOM Variable linking
var soundtrackContainerEl = document.querySelector('#soundtrack-container');
var bigContainer = document.querySelector("#main-container")

// DOM element creation
var artworkContainerEl = document.createElement("div");
var searchForm = document.createElement("form")
var inputField = document.createElement("input");

// Submit Button element creation 
var submitButton = document.createElement("button");
submitButton.textContent = "SEARCH";

// Populate the HTML with DOM elements 
searchForm.appendChild(inputField);
searchForm.appendChild(submitButton);
bigContainer.appendChild(searchForm);
bigContainer.appendChild(artworkContainerEl);

// Global Variable Declarations
var spotifyToken;
var searchTerm;

// Local Storage Array 
var objectToSaveEachSearch = {};

// This function triggers the application to begin by capturing the user search criteria and resets the input field
var formSubmitHandler = function (event) {

    event.preventDefault();

    // Clean up user input
    searchTerm = inputField.value.trim();

    // Clear old content
    artworkContainerEl.textContent = '';
    inputField.value = '';

    // This comment is pointless
    if (searchTerm) {
        getSpotifyData(spotifyToken, searchTerm)
    }
    else {
        // TODO: modal alert - create HTML element for modal with class hidden - unhide if searchTerm is not valid
    }
};

// This function appends the dynamically created elements to the page
var displayOmdb = function (movieData) {

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
    // Iterates through possible array of ratings 
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
        noRatings.textContent = "Sorry, there are no ratings for this movie."
    }

    // Website link 
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

    saveSearchResults();
};

// This function fetches from the Open Movie Database and passes the data to the displayOmdb function
var getOmdbData = function (showName) {

    // OMDb API 
    var apiUrl = `http://www.omdbapi.com/?apikey=eb60e924&t=${showName}`;

    // make a get request to url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        displayOmdb(data);
                    });
            } else {
                alert('Error: ' + response.statusText); //TODO: make into modal
            }
        })
        .catch(function (error) {
            alert('Unable to connect to OMDB'); //TODO: make into modal
        });
};

// This function will fetch from the Spotify API to get access token
var getSpotifyToken = function () {

    // ClientId & ClientSecret from our Spotify developer account 
    var clientId = "c0c739d14fa7455c845f2543a0bdd7a2";
    var clientSecret = "3892b03191084834a523304de30afb9f";

    // Spotify API for accessing token
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
        });
};

// This function gets the Spotify URL and album cover and calls the OMDb function 
var getSpotifyData = function (token, searchString) {

    // Get Spotify API soundtrack data 
    var spotifyApiUrl = 'https://api.spotify.com/v1/search?q=' + searchString + ' Original%20Motion%20Picture&type=album';

    fetch(spotifyApiUrl, {
        method: 'GET',
        headers: { "Authorization": 'Bearer ' + token },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Call OMDb function to get OMDb data
            getOmdbData(searchString);

            // Getting Spotify URL link to soundtrack
            var urlToPass = data.albums.items[0].external_urls.spotify;
            objectToSaveEachSearch.spotifyLink = urlToPass;
            var albumCover = data.albums.items[0].images[0].url;
            displaySpotifyData(urlToPass, albumCover)
        });
};

// This function displays spotify first search results
var displaySpotifyData = function (urlToPass, albumCover) {

    var urlToClick = document.createElement("a");
    urlToClick.setAttribute("href", urlToPass);
    urlToClick.setAttribute("target", "_blank");

    var albumCoverToClick = document.createElement("img");
    albumCoverToClick.src = albumCover;

    urlToClick.appendChild(albumCoverToClick);
    artworkContainerEl.appendChild(urlToClick);
}

// Save users search input and results into local storage
var saveSearchResults = function () {

    // Gets saved search results from local storage or creates a new empty array
    var getData = JSON.parse(localStorage.getItem("moviemusicmagic")) || [];
    getData.unshift(objectToSaveEachSearch);

    // Sets local storage to contain latest search object
    localStorage.setItem("moviemusicmagic", JSON.stringify(getData));
};

// TODO: Load previous users search history on page 
var loadSavedSearches = function () { };


getSpotifyToken();

// Add event listeners to search form
searchForm.addEventListener('submit', formSubmitHandler);
