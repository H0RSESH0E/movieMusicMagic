var soundtrackContainerEl = document.querySelector('#soundtrack-container');
var bigContainer = document.querySelector("#main-container")
var artworkContainerEl = document.createElement("div");

// Variable Declarations
var spotifyToken;


var searchForm = document.createElement("form")
var inputField = document.createElement("input");
var submitButton = document.createElement("button")
submitButton.textContent = "SEARCH";

searchForm.appendChild(inputField);
searchForm.appendChild(submitButton);
bigContainer.appendChild(searchForm);
bigContainer.appendChild(artworkContainerEl);


// This function captures the user search criteria and resets the input field
var formSubmitHandler = function (event) {

    event.preventDefault();
    var showName = inputField.value.trim();
    if (showName) {
        getOmdbData(showName);
        artworkContainerEl.textContent = '';
        inputField.value = '';
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

    // Official Show Title
    var showTitleEl = document.createElement("h2");
    showTitleEl.textContent = movieData.Title;

    // Year
    var yearEl = document.createElement("h4");
    yearEl.textContent = movieData.Year;

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
var getSpotifyToken = function (showName) {
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
        .then(function(response) {
        return response.json();
    })
    .then (function(data) {
        spotifyToken = data.access_token;
        console.log(spotifyToken);
    });

};


var spotifyApiUrl = 'https://api.spotify.com/v1';


getSpotifyToken ();
// add event listeners to forms
searchForm.addEventListener('submit', formSubmitHandler);
