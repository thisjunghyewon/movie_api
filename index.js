const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  Models = require("./models.js");

//“Models.Movie” and “Models.User” refer to the model names you defined in the “models.js” file.
const Genres = Models.Genre;
const Directors = Models.Director;
const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// //Enable morgan logging to 'log.txt'
// app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("combined"));

// Routes all requests for static files
app.use(express.static("public")); //to the 'public' folder

//application of body parser as middleware into the app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This allows Mongoose to connect to that database.
mongoose.connect("mongodb://127.0.0.1:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//CREATE - Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post("/users", async (req, res) => {
  await Users.findOne({ Name: req.body.Name }) //req.body is the request that the user sends
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Name + "already exists");
      } else {
        Users.create({
          //Allow to collect all of the information from the HTTP request body, use Mongoose to populate a user document, then add it to the database.
          Name: req.body.Name,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// let users = [
//   {
//     id: 1,
//     name: "Kim",
//     favoriteMovies: [],
//   },
//   {
//     id: 2,
//     name: "Joe",
//     favoriteMovies: ["Happy as Lazzaro"],
//   },
// ];

// let movies = [
//   {
//     Title: `Happy as Lazzaro`,
//     Year: "2018",
//     ImageURL:
//       "https://www.imdb.com/title/tt6752992/mediaviewer/rm1599581441/?ref_=ext_shr_lnk",
//     Description: `An unceasingly kind Italian peasant and his family are blatantly exploited by a tobacco baroness.`,
//     Director: {
//       Name: "Alice Rorwacher",
//       Birth: "1982",
//       Death: "",
//       Bio: `Alice Rohrwacher was born in 1982 in Fiesole, Tuscany, Italy. She is a director and writer, known for Happy as Lazzaro (2018), The Wonders (2014) and Corpo Celeste (2011).`,
//     },
//     Genre: {
//       Name: "Drama",
//       Description:
//         "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
//     },
//   },
//   {
//     Title: `Phantom Thread`,
//     Year: "2017",
//     ImageURL:
//       "https://www.imdb.com/title/tt5776858/mediaviewer/rm2975619328/?ref_=ext_shr_lnk",
//     Description: `Set in 1950s London, Reynolds Woodcock is a renowned dressmaker whose fastidious life is disrupted by a young, strong-willed woman, Alma, who becomes his muse and lover.`,
//     Director: {
//       Name: "Paul Thomas Anderson",
//       Birth: "1970",
//       Death: "",
//       Bio: "He was one of the first of the video store generation of film-makers. The success of Boogie Nights gave Anderson the chance to really go for broke in Magnolia, a massive mosaic that could dwarf Altman`s Nashville in its number of characters. Anderson was awarded a Best Director award at Cannes for Punch-Drunk Love.",
//     },

//     Genre: [
//       {
//         Name: "Drama",
//         Description:
//           "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
//       },
//       {
//         Name: "Romance",
//         Description:
//           "Should contain numerous inter-related scenes of a character and their personal life with emphasis on emotional attachment or involvement with other characters, especially those characterized by a high level of purity and devotion. Note: Reminder, as with all genres if this does not describe the movie wholly, but only certain scenes or a subplot, then it should be submitted as a keyword instead.",
//       },
//     ],
//   },
//   {
//     Title: "The Fabelmans",
//     Year: "2022",
//     ImageURL:
//       "https://www.imdb.com/title/tt14208870/mediaviewer/rm3355774209?ref_=ext_shr_lnk",
//     Description:
//       "Growing up in post-World War II era Arizona, young Sammy Fabelman aspires to become a filmmaker as he reaches adolescence, but soon discovers a shattering family secret and explores how the power of films can help him see the truth.",
//     Director: {
//       Name: "Steven Spielberg",
//       Birth: "1946",
//       Death: "",
//       Bio: "One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywood's best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.",
//     },
//     Genre: {
//       Name: "Drama",
//       Description:
//         "Should contain numerous consecutive scenes of characters portrayed to effect a serious narrative throughout the title, usually involving conflicts and emotions. This can be exaggerated upon to produce melodrama.",
//     },
//   },
// ];

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

//default text response when at /
app.get("/", (req, res) => {
  res.send("Welcome to MyFlix!");
});

//READ - get all users
app.get("/users", async (req, res) => {
  await Users.find()
    .populate("Favorite_movies", "Title")
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ - get a user by username
app.get("/users/:Name", async (req, res) => {
  await Users.findOne({ Username: req.params.Name })
    .populate("Favorite_movies", "Title")
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ - get a list of all movies to the user
app.get("/movies", (req, res) => {
  Movies.find()
    .populate("Genre", "Name")
    .populate("Director", "Name")
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ: Return data about a single movie by title to the user
app.get("/movies/:Title", async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .populate("Genre", "Name")
    .populate("Director", "Name")
    .then((movie) => {
      req.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ: Return a list of All genres
app.get("/genre", async (req, res) => {
  await Genres.find()
    .then((genres) => {
      res.status(200).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ: Return data about a single genre by name
app.get("/genres:Name", async (req, res) => {
  await Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.status(200).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ: Return a list of All directors
app.get("/directors", async (req, res) => {
  await Directors.find()
    .then((directors) => {
      res.status(200).json(directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// READ: Return data about a director by name
app.get("/directors:Name", async (req, res) => {
  await Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      res.status(200).json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//UPDATE -  Allow users to update their user info by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put("/users/:Name", async (req, res) => {
  await Users.findOneAndUpdate(
    { Name: req.params.Name },
    {
      $set: {
        Name: req.body.Name,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .populate("Favorite_movies", "Title")
    .then((updatedUser) => {
      res.status(201).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//UPDATE(CREATE) - Add a movie to a user's list of favorites
app.post("/users/:Name/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { Name: req.params.Name },
    {
      $push: { Favorite_movies: req.params.MovieID },
    },
    { new: true }
  ) // this makes sure that the updated document is returned
    .populate("Favorite_movies", "Title")
    .then((updatedUser) => {
      res.status(201).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//DELETE - Delete a user by username
app.delete("/users/:Name", async (req, res) => {
  await Users.findOneAndRemove({ Name: req.params.Name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Name + " was not found");
      } else {
        res.status(200).send(req.params.Name + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//DELETE - remove a movie from user's favorite movies list
app.delete("/users/:Name/movies/:MovieID", async (req, res) => {
  await Users.findOneAndRemove(
    { Name: req.params.Name },
    {
      $pull: { Favorite_movies: req.params.MovieID },
    },
    { new: true }
  ) // this makes sure that the updated document is returned
    .populate("Favorite_movies", "Title")
    .then((updatedUser) => {
      res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Setup Logging
const accessLogStream = fs.createWriteStream(
  // create a write stream (in append mode)
  path.join(__dirname, "log.txt"), // a ‘log.txt’ file is created in root directory
  { flags: "a" }
);

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack); // information about the error will be logged to the terminal, then logged in the console
  res.status(500).send("Something broke!");
});

// //UPDATE
// app.put("/users/:id", (req, res) => {
//   const { id } = req.params;
//   const updatedUser = req.body;

//   // if there is a user, we're going to give it the new updated user's name. so, this shouldn't be const
//   let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

//   if (user) {
//     user.name = updatedUser.name;
//     res.status(200).json(user);
//   } else {
//     res.status(400).send("no such user");
//   }
// });

// //CREATE(UPDATE)
// app.post("/users/:id/:movieTitle", (req, res) => {
//   const { id, movieTitle } = req.params;

//   let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

//   if (user) {
//     user.favoriteMovies.push(movieTitle);
//     res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
//   } else {
//     res.status(400).send("no such user");
//   }
// });

// //DELETE - this allows users to remove a movie from their list of favorites.
// app.delete("/users/:id/:movieTitle", (req, res) => {
//   const { id, movieTitle } = req.params;

//   let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

//   if (user) {
//     user.favoriteMovies = user.favoriteMovies.filter(
//       (title) => title !== movieTitle
//     ); // we only want the movies in our favorite movies array that do not match the one we are trying to remove right now.
//     res
//       .status(200)
//       .send(`${movieTitle} has been removed from user ${id}'s array`);
//   } else {
//     res.status(400).send("no such user");
//   }
// });

// // DELETE - this allows existing users to deregister, (showing only a text that a user email has been removed.)
// app.delete("/users/:id", (req, res) => {
//   const { id } = req.params;

//   let user = users.find((user) => user.id == id); //using two equal signs, they will be truthy

//   if (user) {
//     users = users.filter((user) => user.id != id); // we're comparing a string to a number.
//     res.status(200).send(` user ${id} has been deleted`);
//   } else {
//     res.status(400).send("no such user");
//   }
// });

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
