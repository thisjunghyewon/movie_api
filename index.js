const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

// Enable morgan logging to 'log.txt'
// app.use(morgan("combined", { stream: accessLogStream }));

// // // Routes all requests for static files
// app.use(express.static("public")); //to the 'public' folder

//application of body parser as middleware into the app
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["Happy as Lazzaro"],
  },
];

let movies = [
  {
    Title: `Happy as Lazzaro`,
    Year: "2018",
    ImageURL:
      "https://www.imdb.com/title/tt6752992/mediaviewer/rm1599581441/?ref_=ext_shr_lnk",
    Description: `An unceasingly kind Italian peasant and his family are blatantly exploited by a tobacco baroness.`,
    Director: {
      Name: "Alice Rorwacher",
      Birth: "1982",
      Death: "",
      Bio: `Alice Rohrwacher was born in 1982 in Fiesole, Tuscany, Italy. She is a director and writer, known for Happy as Lazzaro (2018), The Wonders (2014) and Corpo Celeste (2011).`,
    },
    Genre: {
      Name: "Drama",
      Description:
        "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
    },
  },
  {
    Title: `Phantom Thread`,
    Year: "2017",
    ImageURL:
      "https://www.imdb.com/title/tt5776858/mediaviewer/rm2975619328/?ref_=ext_shr_lnk",
    Description: `Set in 1950s London, Reynolds Woodcock is a renowned dressmaker whose fastidious life is disrupted by a young, strong-willed woman, Alma, who becomes his muse and lover.`,
    Director: {
      Name: "Paul Thomas Anderson",
      Birth: "1970",
      Death: "",
      Bio: "He was one of the first of the video store generation of film-makers. The success of Boogie Nights gave Anderson the chance to really go for broke in Magnolia, a massive mosaic that could dwarf Altman`s Nashville in its number of characters. Anderson was awarded a Best Director award at Cannes for Punch-Drunk Love.",
    },

    Genre: [
      {
        Name: "Drama",
        Description:
          "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
      },
      {
        Name: "Romance",
        Description:
          "Should contain numerous inter-related scenes of a character and their personal life with emphasis on emotional attachment or involvement with other characters, especially those characterized by a high level of purity and devotion. Note: Reminder, as with all genres if this does not describe the movie wholly, but only certain scenes or a subplot, then it should be submitted as a keyword instead.",
      },
    ],
  },
  {
    Title: "The Fabelmans",
    Year: "2022",
    ImageURL:
      "https://www.imdb.com/title/tt14208870/mediaviewer/rm3355774209?ref_=ext_shr_lnk",
    Description:
      "Growing up in post-World War II era Arizona, young Sammy Fabelman aspires to become a filmmaker as he reaches adolescence, but soon discovers a shattering family secret and explores how the power of films can help him see the truth.",
    Director: {
      Name: "Steven Spielberg",
      Birth: "1946",
      Death: "",
      Bio: "One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood's best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.",
    },
    Genre: {
      Name: "Drama",
      Description:
        "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
    },
  },
];

// listen for requests
app.listen(8080, () => console.log("Your app is listening on port 8080."));

//CREATE
app.post("/users", (req, res) => {
  const newUser = req.body; //this enables me us to read data from the body object.

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser); //201 is create
  } else {
    res.status(400).send("users need names");
  }
});

//READ
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//READ: Return data about a single movie by title to the user
app.get("/movies/:title", (req, res) => {
  const { title } = req.params; //object restruction
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

// READ: Return data about a genre (description) by name/title (e.g., “Thriller”)
//Question: Why it shows always the first data?
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

// READ: Return data about a director by name/title
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

//UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  // if there is a user, we're going to give it the new updated user's name. so, this shouldn't be const
  let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

//CREATE(UPDATE)
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

//DELETE - this allows users to remove a movie from their list of favorites.
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    ); // we only want the movies in our favorite movies array that do not match the one we are trying to remove right now.
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

// DELETE - this allows existing users to deregister, (showing only a text that a user email has been removed.)
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

  if (user) {
    users = users.filter((user) => user.id != id); // we're comparing a string to a number.
    res.status(200).send(` user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

// let genres = [
//   {
//     Name: "Drama",
//     Description:
//       "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
//   },
//   {
//     Name: "Romance",
//     Description:
//       "Should contain numerous inter-related scenes of a character and their personal life with emphasis on emotional attachment or involvement with other characters, especially those characterized by a high level of purity and devotion. Note: Reminder, as with all genres if this does not describe the movie wholly, but only certain scenes or a subplot, then it should be submitted as a keyword instead.",
//   },
// ];

// let director = [
//   {
//     Name: "Steven Spielberg",
//     Birth: "1946",
//     Death: "",
//     Bio: `One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood's best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.`,
//   },
// ];
//Setup Logging
// const accessLogStream = fs.createWriteStream(
//   // create a write stream (in append mode)
//   path.join(__dirname, "log.txt"), // a ‘log.txt’ file is created in root directory
//   { flags: "a" }
// );

// // GET requests
// app.get("/movies", (req, res) => {
//   res.json(movies);
// });

//READ - Greeting
app.get("/", (req, res) => {
  res.send("Welcome to myFlix");
});

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack); // information about the error will be logged to the terminal, then logged in the console
  res.status(500).send("Something broke!");
});
