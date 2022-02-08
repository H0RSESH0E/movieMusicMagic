var searchFormEl = document.querySelector("#search-form");
var inputFieldEl = document.querySelector("input");
var movieSectionEl = document.querySelector("#movie-section");
var musicSectionEl = document.querySelector("#music-section");
var searchHistoryContainerEl = document.querySelector("#display-search-history");

// Submit Button element creation 
var submitButton = document.querySelector("#search-btn");

// Global Variable Declarations
var spotifyToken;
var searchTerm;
var omdbDataGlobal;
var searchHistory = [];

// Local Storage Array 
var objectToSaveEachSearch = {};
var getData = [];
// This function triggers the application to begin by capturing the user search criteria and resets the input field
var formSubmitHandler = function (event) {

    event.preventDefault();

    movieSectionEl.classList.remove("is-hidden");
    musicSectionEl.classList.remove("is-hidden");
    searchHistoryContainerEl.classList.add("is-hidden");

    // Clean up user input
    searchTerm = inputFieldEl.value.trim();

    // Clear old content
    inputFieldEl.value = '';

    // This comment is pointless
    if (searchTerm) {
        getOmdbData(searchTerm);
        // getSpotifyData(spotifyToken, searchTerm)
    }
    else {
        openErrorAlertModal("That does not appear to be a valid search term.");
    }
};

// This function appends the dynamically created elements to the page
var displayOmdb = function (movieData) {

    // Poster Art
    var posterEl = document.querySelector("#movieImage");
    posterEl.setAttribute("src", movieData.Poster);
    objectToSaveEachSearch.poster = movieData.Poster;
    // Official Show Title
    var showTitleEl = document.querySelector("#movie-title");
    showTitleEl.textContent = `${movieData.Title} (${movieData.Year})`;
    objectToSaveEachSearch.title = movieData.Title
    // Year
    objectToSaveEachSearch.year = movieData.Year;
    // Iterates through possible array of ratings 
    var ratingsPar = document.querySelector("#movie-rating");
    ratingsPar.innerHTML = "";
    if (movieData.Ratings.length > 0) {
        for (var i = 0; i < movieData.Ratings.length; i++) {
            var ratingContainer = document.createElement("div");
            var individualRatingSourceEl = document.createElement("span")
            var individualRatingEl = document.createElement("span");

            individualRatingSourceEl.textContent = `${movieData.Ratings[i].Source}: \u00a0 ${movieData.Ratings[i].Value}`;

            ratingContainer.appendChild(individualRatingSourceEl);
            ratingContainer.appendChild(individualRatingEl);
            ratingsPar.appendChild(ratingContainer);
        }
    }
    else {
        var noRatings = document.createElement("span");
        noRatings.textContent = "Sorry, there are no ratings for this movie."
        ratingsPar.appendChild(noRatings);
    }

    // Website link 
    var websiteEl = document.querySelector("#movie-website");
    if (movieData.Website !== "N/A") {
        websiteEl.setAttribute("href", movieData.Website);
        websiteEl.textContent = movieData.Website;
    }

    saveSearchResults(movieData);
};

// This function fetches from the Open Movie Database and passes the data to the displayOmdb function
var getOmdbData = function (showName) {

    // OMDb API 
    var apiUrl = `http://www.omdbapi.com/?apikey=eb60e924&t=${showName}`;
    // FOR TESTING: openErrorAlertModal('Error: ' + searchTerm);
    // make a get request to url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json()
                    .then(function (data) {
                        console.log(data);
                        if (data.Response === "False") {
                            openErrorAlertModal('The server says: ' + data.Error);
                        }
                        else {
                            omdbDataGlobal = data;
                            getSpotifyData(spotifyToken, searchTerm)

                        }
                    });
            } else {
                openErrorAlertModal('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            openErrorAlertModal("Please check your connection settings. " + error);
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
            if (response.ok) {
                response.json()

                    .then(function (data) {
                        console.log("This is the spotify YYYYYY: ", data);
                        console.log(data.albums.items.length)
                        if (data.albums.items.length > 0) {
                            var urlToPass = data.albums.items[0].external_urls.spotify;
                            objectToSaveEachSearch.spotifyLink = urlToPass;
                            var albumCover = data.albums.items[0].images[0].url;
                            var soundtrackTitle = data.albums.items[0].name;
                            console.log("soundtrackTitle: ", soundtrackTitle, " & omdbDataGlobal.Title: ", omdbDataGlobal.Title);
                            var spotifyAlbumYear = data.albums.items[0].release_date;
                            spotifyAlbumYear = spotifyAlbumYear.slice(0, 4);
                            if (omdbDataGlobal.Year === spotifyAlbumYear) {
                                displayOmdb(omdbDataGlobal);
                                displaySpotifyData(urlToPass, albumCover, soundtrackTitle);
                            }
                            else {
                                displayOmdb(omdbDataGlobal);
                                unofficialSoundtrackResult(token, searchString);
                            }
                        }
                        else {
                            displayOmdb(omdbDataGlobal);
                            unofficialSoundtrackResult(token, searchString);

                        }
                    });

            }
            else {
                openErrorAlertModal('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            openErrorAlertModal("Please check your connection settings. " + error);
        });


};

var unofficialSoundtrackResult = function (token, searchString) {
    // Get Spotify API non "Original Motion Picture" data 
    var spotifyApiUrl = `https://api.spotify.com/v1/search?q=${searchString} ${omdbDataGlobal.Year} soundtrack&type=playlist`;


    fetch(spotifyApiUrl, {
        method: 'GET',
        headers: { "Authorization": 'Bearer ' + token },
    })
        .then(function (response) {
            if (response.ok) {
                response.json()

                    .then(function (data) {
                        console.log("This is the second data requested: ", data);
                        if (data.playlists.items.length > 0) {
                            var urlToPass = data.playlists.items[0].external_urls.spotify;
                        objectToSaveEachSearch.spotifyLink = urlToPass;
                        var albumCover = data.playlists.items[0].images[0].url;
                        var soundtrackTitle = `Unofficial Playlist: ${data.playlists.items[0].name}`;

                        displaySpotifyData(urlToPass, albumCover, soundtrackTitle);

                    }
                    else {
                        clearSpotifyData();
                    }
                    });

            }
            else {
                openErrorAlertModal('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            openErrorAlertModal("Please check your connection settings. " + error);
        });





}

// This function displays spotify first search results
var displaySpotifyData = function (urlToPass, albumCover, soundtrackTitle) {

    var urlToClick = document.querySelector("#spotify-link");
    urlToClick.setAttribute("href", urlToPass);
    urlToClick.setAttribute("target", "_blank");

    var albumCoverToClick = document.querySelector("#musicImage");
    albumCoverToClick.setAttribute("src", albumCover);

    var soundtrackTitleToClick = document.querySelector("#spotify-title");
    soundtrackTitleToClick.textContent = soundtrackTitle;

};

var clearSpotifyData = function () {
    var urlToClick = document.querySelector("#spotify-link");
    urlToClick.setAttribute("href", "");
    urlToClick.setAttribute("target", "_blank");

    var albumCoverToClick = document.querySelector("#musicImage");
    albumCoverToClick.setAttribute("src", "");

    var soundtrackTitleToClick = document.querySelector("#spotify-title");
    soundtrackTitleToClick.textContent = "Sorry.  There is no official original motion picture soundtrack or matching unofficial soundtrack playlist.";
}

// Save users search input and results into local storage
var saveSearchResults = function (movieData) {

    // Gets saved search results from local storage or creates a new empty array
    var getData = JSON.parse(localStorage.getItem("moviemusicmagic")) || [];

    for (var i = 0; i < getData.length; i++) {
        if (getData[i].title === movieData.Title) {
            getData.splice(i, 1);
            break;
        }
    }
    
    // Only stores 3 recent searchs from user 
    if (getData.length > 2) {
        getData.pop();
    }

    getData.unshift(objectToSaveEachSearch);

    // Sets local storage to contain latest search object
    localStorage.setItem("moviemusicmagic", JSON.stringify(getData));
};

var openErrorAlertModal = function (errorMsg) {
    var modal = document.querySelector(".modal");
    modal.classList.add("is-active");
    var modalCardBody = document.querySelector(".modal-card-body");
    modalCardBody.innerHTML = `<p>Sorry.  There seems to be a problem:<br> ${errorMsg}</p>`
    var modalClose = document.querySelector(".is-active");
    modalClose.addEventListener('click', closeErrorAlertModal);

};

var closeErrorAlertModal = function (event) {
    console.log(event);
    var modal = document.querySelector(".modal");
    modal.classList.remove("is-active");
};


// TODO: Load previous users search history on page 
var loadSavedSearches = function () {

    var savedSearches = JSON.parse(localStorage.getItem("moviemusicmagic"));

    if (savedSearches !== null) {
        searchHistory = savedSearches;
    }

    displaySearchHistory();

    
};

var displaySearchHistory = function () {
    console.log(searchHistory);

    for (var i =0; i < searchHistory.length; i++) {
        var searchHistoryList = document.querySelector(".search-history-list")
        var searchHistoryImage = document.querySelector("#search-history-image");
        var searchHistoryTitle = document.querySelector("#search-history-title");

        searchHistoryList.setAttribute("href", searchHistory[i].spotifyLink);
        searchHistoryList.setAttribute("target", "_blank");

        searchHistoryImage.setAttribute("src", searchHistory[i].poster);
        searchHistoryTitle.textContent = searchHistory[i].title;

        searchHistoryList.appendChild(searchHistoryImage);
        searchHistoryList.appendChild(searchHistoryTitle);
        searchHistoryContainerEl.appendChild(searchHistoryList);
    }
}

getSpotifyToken();
loadSavedSearches();
// Add event listeners to search form
searchFormEl.addEventListener('submit', formSubmitHandler);
searchHistoryContainerEl.addEventListener("click", loadSavedSearches)