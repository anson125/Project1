$(document).ready(function() {
  var config = {
    apiKey: "AIzaSyBsJZ2ZSkf8F253DX2j3XY9wOzEnpxNFxQ",
    authDomain: "bootcampproject1-kohl-philo-kt.firebaseapp.com",
    databaseURL: "https://bootcampproject1-kohl-philo-kt.firebaseio.com",
    projectId: "bootcampproject1-kohl-philo-kt",
    storageBucket: "bootcampproject1-kohl-philo-kt.appspot.com",
    messagingSenderId: "903960143582"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  database
    .ref()
    .orderByChild("dateAdded")
    .limitToLast(1)
    .on(
      "child_added",
      function(snapshot) {
        console.log(snapshot.val());
        $("#theImg2").attr("src", snapshot.val().imagetofirebase);
      },
      function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      }
    );

  var API_URL = "https://api-us.faceplusplus.com/facepp/v3/detect";
  var API_KEY = "yOD8xeqc_2sZRuMQuL1zfKvce-MRAIwI";
  var API_SECRET = "SvehIfbpXzUXjvYBCqkiwhjwWukLQJs3";

  $("#imgForm").on("submit", function() {
    event.preventDefault();
    var image_url = $("#imgurl")
      .val()
      .trim();

    var imageCheck = image_url.substring(0, 4);
    if (imageCheck === "http") {
      database.ref().push({
        imagetofirebase: image_url,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });
      $("#theImg").attr("src", image_url);
      identifyEmotion(image_url);
      $("#errorMessage").empty();
    } else {
      $("#errorMessage").append("Not vaild URL!");
    }

    $("#gifs-appear-here").empty();
    $("#emotionText").empty();
  });

  function identifyEmotion(image_url) {
    var queryURL =
      API_URL +
      "?api_key=" +
      API_KEY +
      "&api_secret=" +
      API_SECRET +
      "&image_url=" +
      image_url +
      "&return_attributes=emotion";

    $.ajax({
      url: queryURL,
      method: "POST"
    }).then(function(response) {
      // console.log(response.faces[0].attributes.emotion);  //data response.faces[0].attributes.emotion
      var emotionsList = response.faces[0].attributes.emotion;
      // console.log(emotionsList)
      var keys = Object.keys(emotionsList);
      keys.sort(function(a, b) {
        return emotionsList[b] - emotionsList[a];
      });
      // console.log(keys);
      // console.log(keys[0]);

      var emotion = keys[0];
      console.log(emotion);
      $("#emotionText").append(
        "This picture's calculated emotion is " + emotion
      );
      createSynonymButtons(emotion);
    });
  }
  // we will create a function to pass in the word
  function createSynonymButtons(word) {
    var queryURL =
      "http://words.bighugelabs.com/api/2/d49d6cfaa20d4dd74f649fe59a83969e/" +
      word +
      "/json";

    // Performing our AJAX GET request
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      var parsedresponse = JSON.parse(response);

      var synonymArray = [word];

      for (wordType in parsedresponse) {
        for (synOrsim in parsedresponse[wordType]) {
          for (word in parsedresponse[wordType][synOrsim]) {
            if (synonymArray.length < 5) {
              synonymArray.push(parsedresponse[wordType][synOrsim][word]);
            }
          }
        }
      }
      createButtons(synonymArray);
    });
  }

  function createButtons(synonymArray) {
    $("#buttons-view").empty();

    for (var i = 0; i < synonymArray.length; i++) {
      console.log(synonymArray.length);
      var synonymButton = $("<button>");
      synonymButton.addClass("synonym");
      synonymButton.attr("data-synonym", synonymArray[i]);
      synonymButton.text(synonymArray[i]);
      $("#buttons-view").append(synonymButton);
    }
  }

  // Event listener for all button elements
  $(document).on("click", ".synonym", function() {
    // In this case, the "this" keyword refers to the button that was clicked
    var synonym = $(this).attr("data-synonym");

    // Constructing a URL to search Giphy for the name of the person who said the quote
    var queryURL =
      "https://api.giphy.com/v1/gifs/search?q=" +
      synonym +
      "&api_key=VB3BfFDW5sNyruOi6YZFWrgYA7apeTlC&limit=5";

    // Performing our AJAX GET request
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      // After the data comes back from the API
      // Storing an array of results in the results variable
      var results = response.data;

      // Looping over every result synOrsim
      for (var i = 0; i < results.length; i++) {
        // Only taking action if the photo has an appropriate rating
        if (results[i].rating !== "r" && results[i].rating !== "pg-13") {
          // Creating a div with the class "synOrsim"
          var gifDiv = $("<div class='synOrsim'>");

          // Storing the result synOrsim's rating
          var rating = results[i].rating;

          // Creating a paragraph tag with the result synOrsim's rating
          var p = $("<p>").text("Rating: " + rating);

          // Creating an image tag
          var synonymImage = $("<img>");

          // Giving the image tag an src attribute of a proprty pulled off the
          // result synOrsim
          synonymImage.attr("src", results[i].images.fixed_height.url);

          // Appending the paragraph and personImage we created to the "gifDiv" div we created
          //   gifDiv.append(p);
          gifDiv.append(synonymImage);

          // Prepending the gifDiv to the "#gifs-appear-here" div in the HTML
          $("#gifs-appear-here").prepend(gifDiv);
        }
      }
    });
  });
});
