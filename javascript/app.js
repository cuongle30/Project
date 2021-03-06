var youtubeVideos = [];
var titleSearch = "";
var year = "";

// --- form validation ---
$("#title-validation").hide();

// --- movie not found notice ---
$("#movie-not-found-msg").hide();

//  --- Return Searches ---
//Click event and query YouTube for Search button
document.getElementById("movie-search-btn").addEventListener("click", function (event) {
  event.preventDefault();
  // Variable to grab data from user search
  titleSearch = document.getElementById("title-input").value.trim();

  // form validation
  if (titleSearch == "") {
    $('#title-validation').slideDown("slow");
    $('#title-validation').slideUp(3000);
  } else {
    getData(titleSearch);
    // display the results when someone does a search
    $("#results").show();
    shiftFocalPoint()
  }
});

// OMDB search for trending movies
// displayMovieInfo function that is called when the button is clicked
function displayMovieInfo() {
  // Only run code if the current element has the "movie-btn" class
  if (this.classList.contains("movie-btn")) {
    // Set the movie search to the button id that we set earlier 
    var movie = event.target.getAttribute("id");
    getButtonData(movie);
  }
  // display the results when someone clicks the trending movies button
  shiftFocalPoint()
  $("#results").show();
}

//create iframe for youtube
function video() {
  console.log("video function call")
  var tag = document.createElement('script');
  tag.id = 'iframe-demo';
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
//run youtube function.
var ytplayer;
function onYouTubeIframeAPIReady() {
  console.log("onYouTubeIframeAPIReady")
  ytplayer = new YT.Player('spherical-video-player', {
    height: '450px',
    width: '700px',
  });
}
video();

// Function for building our ajax response
function renderMovieElements(response) {
  // Creating a div to hold the movie
  var movieDiv = document.createElement("div");
  // bootstrap styling
  movieDiv.setAttribute("class", "movie p-2 mr-2");

  // storing the title data
  var title = response.Title;

  // creating an element to hold the title
  var h2Title = document.createElement("h2");
  h2Title.innerHTML = `<b>${title}</b>`;

  // displaying the title
  movieDiv.appendChild(h2Title);

  // Retrieving the URL for the image
  var posterImgURL = response.Poster;

  // Creating an element to hold the image
  var posterImage = document.createElement("img");
  posterImage.setAttribute("src", posterImgURL);

  // Appending the image
  movieDiv.appendChild(posterImage);

  // storing the IMDB rating
  var IMDBrating = response.imdbRating;

  // creating an element to hold the IMDB rating
  var pIMDBrating = document.createElement("p");
  pIMDBrating.innerHTML = `<b>IMDb Score: </b>${IMDBrating}`;

  // displaying the IMDB rating
  movieDiv.appendChild(pIMDBrating);

  // storing the second rating source:
  var secondRatingSource = response.Ratings[1].Source;

  // storing the second source rating:
  var secondSourceRating = response.Ratings[1].Value;

  // creating an element to hold the Rotten Tomatoes rating
  var pSecondSourceRating = document.createElement("p");
  pSecondSourceRating.innerHTML = `<b>${secondRatingSource}: </b> ${secondSourceRating}`;

  // displaying the Rotten Tomatoes rating
  movieDiv.appendChild(pSecondSourceRating);

  // storing the genre data
  var genre = response.Genre;

  // creating an element to hold the genre
  var pGenre = document.createElement("p");
  pGenre.innerHTML = `<b>Genre: </b>${genre}`;

  // displaying the genre
  movieDiv.appendChild(pGenre);

  // storing the movie length data
  var movieLength = response.Runtime;

  // creating an element to hold the genre
  var pMovieLength = document.createElement("p");
  pMovieLength.innerHTML = `<b>Movie length: </b>${movieLength}`;

  // displaying the genre
  movieDiv.appendChild(pMovieLength);

  // Storing the rating data
  var rating = response.Rated;

  // Creating an element to have the rating displayed
  var pRating = document.createElement("p");
  pRating.innerHTML = `<b>Rating: </b>${rating}`;

  // Displaying the rating
  movieDiv.appendChild(pRating);

  // Storing the release year
  var released = response.Released;

  // Creating an element to hold the release year
  var pReleased = document.createElement("p");
  pReleased.innerHTML = `<b>Released: </b>${released}`;

  // Displaying the release year
  movieDiv.appendChild(pReleased);

  // Storing the plot
  var plot = response.Plot;

  // Creating an element to hold the plot
  var pPlot = document.createElement("p");
  pPlot.innerHTML = `<b>Plot: </b>${plot}`;

  // Appending the plot
  movieDiv.appendChild(pPlot);

  // Storing the actors
  var actors = response.Actors;

  // Creating an element to hold the actors
  var pActors = document.createElement("p");
  pActors.innerHTML = `<b>Actors: </b>${actors}`;

  // Appending the actors
  movieDiv.appendChild(pActors);

  // Putting the entire movie above the previous movies
  let movieParent = document.querySelector("#omdb-movie-results");
  movieParent.replaceChild(movieDiv, movieParent.firstChild);
}

//Run Queries for OMDB and Youtube SEARCHES -- this one pushes to firebase and prevents errors from going to firebase
function getData(x) {
  var queryURL = `https://www.omdbapi.com/?t="${x}&apikey=d34a771e`;
  var youtubeQueryURL = "";
  // Creating an AJAX call for the specific movie button being clicked
  // Check if fetch is supported in the browser. If so use fetch 
  if (window.fetch) {
    fetch(queryURL, {
      method: "GET"
    })
      .then((result) => result.json())
      .then((response) => {
        if (response.Error) {
          console.error(response.Error);
          movieNotFound();
        } else {
          pushToFirebase()
          year = response.Year;
          renderMovieElements(response);
          youtubeQueryURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${x + " official trailer"}+${year}&key=AIzaSyDmKkf_-rWtH9yJ4insi91j9DWhxwj1e-o`
          youtubeFetch();
        }
      });
  } else { // if fetch is not supported use XHR
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL);
    xhr.onload = event => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let response = JSON.parse(xhr.response)
          year = response.Year;
          renderMovieElements(response);
        } else {
          console.error(xhr.responseText);
          movieNotFound();
        }
      }
    };
    xhr.onerror = event => {
      console.error(xhr.responseText);
    };
    xhr.send();
  }

  // create a function for performing a request with the queryURL for youtube
  function youtubeFetch() {
    fetch(youtubeQueryURL, {
      method: "GET"
    })
      // Return JsonAfter data comes back from the request
      .then(function (response) {
        return response.json()
      })
      .then(function (response) {
        //Settimeout to allow for response to pull
        document.addEventListener(
          'DOMContentLoaded', () => setTimeout(initializeFreshchatWidget, 100)
        )
        console.log("youtube api responded")
        console.log(response)
        //grab youtube videos from query
        var youtubeVideos = response.items[0].id.videoId
        ytplayer.loadVideoById({ videoId: youtubeVideos })
      });
  }

  // create a function for pushing to firebase
  // --- push to firebase ---
  function pushToFirebase() {
    // create local "temporary" object for holding movie searches
    var newMovie = {
      titleSearch: titleSearch
    };
    console.log("the new move going into firebase is" + newMovie);
    // upload new movie data to the database
    database.ref().push(newMovie);

    // log to console
    console.log(newMovie.titleSearch);

    // --- UI/UX ---
    // clear the text field after someone searches
    document.getElementById("title-input").value = "";

  }
}

// --- run queries for buttons that DON'T call to firebase, couldn't put in the same function the search function needs to consider error responses. the button function does not need to worry about errors because only NONERRORS became buttons. running a search and a button on the same function will create a blank entry in firebase causing an empty button. 
//Run Queries for OMDB and Youtube
function getButtonData(x) {
  var queryURL = `https://www.omdbapi.com/?t="${x}&apikey=d34a771e`;
  var youtubeQueryURL = "";
  // Creating an AJAX call for the specific movie button being clicked
  // Check if fetch is supported in the browser. If so use fetch 
  if (window.fetch) {
    fetch(queryURL, {
      method: "GET"
    })
      .then((result) => result.json())
      .then((response) => {
        if (response.Error) {
          console.error(response.Error);
          movieNotFound();
        } else {
          year = response.Year;
          renderMovieElements(response);
          youtubeQueryURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${x + " official trailer"}+${year}&key=AIzaSyDmKkf_-rWtH9yJ4insi91j9DWhxwj1e-o`
          youtubeFetch();
        }
      });
  } else { // if fetch is not supported use XHR
    const xhr = new XMLHttpRequest();
    xhr.open("GET", queryURL);
    xhr.onload = event => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let response = JSON.parse(xhr.response)
          year = response.Year;
          renderMovieElements(response);
        } else {
          console.error(xhr.responseText);
          movieNotFound();
        }
      }
    };
    xhr.onerror = event => {
      console.error(xhr.responseText);
    };
    xhr.send();
  }

  // create a function for performing a request with the queryURL for youtube
  function youtubeFetch() {
    fetch(youtubeQueryURL, {
      method: "GET"
    })
      // Return JsonAfter data comes back from the request
      .then(function (response) {
        return response.json()
      })
      .then(function (response) {
        //Settimeout to allow for response to pull
        document.addEventListener(
          'DOMContentLoaded', () => setTimeout(initializeFreshchatWidget, 100)
        )
        console.log("youtube api responded")
        console.log(response)
        //grab youtube videos from query
        var youtubeVideos = response.items[0].id.videoId
        ytplayer.loadVideoById({ videoId: youtubeVideos })
      });
  }
}

// --- firebase ---
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBWpkmTPb8Jz22vRZY3PEH4HlmPBlN_-LY",
  authDomain: "great-movies-and-chill.firebaseapp.com",
  databaseURL: "https://great-movies-and-chill.firebaseio.com",
  projectId: "great-movies-and-chill",
  storageBucket: "great-movies-and-chill.appspot.com",
  messagingSenderId: "511630558004"
};

firebase.initializeApp(config);

var database = firebase.database();

// create Firebase event for adding movie to the database
database.ref().on("child_added", function (childSnapshot) {
  console.log(childSnapshot.val());

  // store everything into a variable
  var titleSearch = childSnapshot.val().titleSearch.toUpperCase();

  // displayMovieInfo -- this part is important! how can i get this to compare with what already exists in the html (that it just created)? the firebase would be loaded but the html wouldn't 
  console.log(titleSearch);

  // create temp object of our values
  let tempMovieData = {
    titleSearch: titleSearch
  };

  console.log(tempMovieData);
  // loop through the childSnapshot object and add buttons
  for (let prop of Object.values(tempMovieData)) {
    let newBtn = document.createElement("BUTTON")
    newBtn.innerHTML = prop;
    newBtn.onclick = displayMovieInfo;
    newBtn.classList.add("movie-btn");
    newBtn.setAttribute("id", prop);
    document.getElementById("trending").appendChild(newBtn);
  }
})

// --- UX/UI ---
// --- to remove duplicate buttons ---
// globally accessible empty firebase array to add to 
var firebaseMovies = []
// an array to store only the unique values
var uniqueMovies = []

// hide the trending buttons until someone clicks
$("#trending").hide();

// hide the results area until someone clicks a button or searches for a movie
$("#results").hide();

// when someone clicks the trending button
$("#trending-toggle").click(function () {
  console.log("trending movie has been clicked");
  // add everything in the trending div to an array
  $(".movie-btn").each(function () {
    console.log("this id is: " + this.id);
    firebaseMovies.splice(0, 0, this.id);
  })
  console.log("the firebaseMovies array: " + firebaseMovies);

  // capture only the unique values
  uniqueMovies = getUnique(firebaseMovies);
  console.log("the new unique movies array: " + uniqueMovies);
  clearExistingButtons();
  addUniqueButtons();

  // slide the trending buttons down and change the text of the trending toggle
  var trendingToggleText = $(this);
  $("#trending").slideToggle('slow', function () {
    if ($(this).is(':visible')) {
      trendingToggleText.html(`Hide trending<span class="up-indicator"></span>`);
    } else {
      trendingToggleText.html(`See trending<span class="down-indicator"></span>`);
    }
  });
});

// function for shift focal point
function shiftFocalPoint() {
  document.getElementById("enticing-image").style.height = "70px";
  $(".photo-credit").hide();
  $("#enticing-image").hide();
  document.getElementById("movie-search").removeAttribute("class");
  document.getElementById("movie-search").setAttribute("class", "col-12 rounded");
  document.getElementById("movie-search").style.position = "static";
  document.getElementById("trending-toggle").style.marginLeft = "0px";
  // change the toggle to show
  var trendingToggleElement = $("#trending-toggle");
  trendingToggleElement.html(`See trending<span class="down-indicator"></span>`);
  document.getElementById("trending").style.marginLeft = "0px";
  // hide the trending buttons until someone clicks
  $("#trending").hide();
  // change the margin at media query for the search button
  $("#movie-search-btn").removeClass("orig-focus").addClass("shift-focused");
}

// create a function for when the search doesn't come back with an omdb response
function movieNotFound() {
  $("#results").hide();
  $('#movie-not-found-msg').slideDown("slow");
  $('#movie-not-found-msg').slideUp(3000);
  // --- UI/UX ---
  // clear the text field after someone searches
  document.getElementById("title-input").value = "";
}

//create a function to help remove duplcations pulled from: https://www.tutorialrepublic.com/faq/how-to-remove-duplicate-values-from-a-javascript-array.php
function getUnique(array) {
  var uniqueArray = [];
  for (i = 0; i < array.length; i++) {
    if (uniqueArray.indexOf(array[i]) === -1) {
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
}

// function to loop through unqie array and make buttons
function addUniqueButtons() {
  var i;
  for (i = 0; i < 20; i++) {
    let newBtn = document.createElement("BUTTON")
    newBtn.innerHTML = uniqueMovies[i];
    newBtn.onclick = displayMovieInfo;

    newBtn.setAttribute("class", "movie-btn btn btn-outline-secondary");

    newBtn.setAttribute("id", uniqueMovies[i]);
    document.getElementById("trending").appendChild(newBtn);
  }
}

// function to clear existing buttons
function clearExistingButtons() {
  $("#trending").empty();
}

