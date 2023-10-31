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

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// //Enable morgan logging to 'log.txt'
// app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("combined"));

// Routes all requests for static files
app.use(express.static("public")); //to the 'public' folder

//application of body parser as middleware into the app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { check, validationResult } = require("express-validator");

// it will set the application to allow requests from all origins;
const cors = require("cors");
app.use(cors());

let auth = require("./auth.js")(app);
const passport = require("passport");
require("./passport.js");

// This allows Mongoose to connect to that database.
// mongoose.connect("mongodb://127.0.0.1:27017/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

/**
 * Loads the homepage of the API
 * @return String
 */
app.get("/", (req, res) => {
  res.send("Welcome to MyFlix!");
});

/**
 * Route for all users
 * @return JSON of users
 */
app.get(
  "/users",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      // .populate("Favorite_movies", "Title")
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Single user by username.
 * @param {string} Username
 * @description Must be authenticated with JWT
 * @return JSON of a single user
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      // .populate("Favorite_movies", "Title")
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Create a user
 * @param {string} Username - Username of user: min length of 5 and has to be alphanumeric
 * @param {string} Password
 * @param {string} Email - Email of user must be in valid email format
 * @return JSON of newly created user
 */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password); //Hash any password entered by the user when registering before storing it in the MongoDB database
    await Users.findOne({ Username: req.body.Username }) //req.body is the request that the user sends
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            //Allow to collect all of the information from the HTTP request body, use Mongoose to populate a user document, then add it to the database.
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);

/**
 * Update a user by username
 * @param {string} Username
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Add a movie to a user's favorite list of movies
 * @param {string} Username
 * @param {string} MovieID
 */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { Favorite_movies: req.params.MovieID },
      },
      { new: true }
    ) // this makes sure that the updated document is returned
      .then((user) => {
        res.status(200).json(user.Favorite_movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Remove a movie from a user's favorite list of movies
 * @param {string} Username
 * @param {string} MovieID
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { Favorite_movies: req.params.MovieID },
      },
      { new: true }
    ) // this makes sure that the updated document is returned
      .then((user) => {
        res.status(200).json(user.Favorite_movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Delete a user by username
 * @param {string} Username
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Name: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all movies
 * @description Must be authenticated with JWT
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      // .populate("Genre", "Name")
      // .populate("Director", "Name")
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a movie by title
 * @param {string} Title
 * @description Must be authenticated with JWT
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all genres
 */
app.get(
  "/genres",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Genres.find()
      .then((genres) => {
        res.status(200).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a genre by name
 * @param {string} Name
 */
app.get(
  "/genres/:Name",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Genres.findOne({ Name: req.params.Name })
      .then((genre) => {
        res.status(200).json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all directors
 */
app.get(
  "/directors",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Directors.find()
      .then((directors) => {
        res.status(200).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a director by name
 * @param {string} Name
 */
app.get(
  "/directors/:Name",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Directors.findOne({ Name: req.params.Name })
      .then((directors) => {
        res.status(200).json(directors);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

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

// listen for requests
//process.env.PORT, which looks for a pre-configured port number in the environment variable
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
