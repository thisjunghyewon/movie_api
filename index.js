const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path");
const app = express();

let top10movies = [
  {
    title: "Happy as Lazzaro",
    director: "Alice Rohrwacher",
    year: "2018",
  },
  {
    title: "Phantom Thread",
    director: "Paul Thomas Anderson",
    year: "2017",
  },
  {
    title: "The Fabelmans",
    director: "Steven Spielberg",
    year: "2022",
  },
  {
    title: "Little Women",
    director: "Greta Gerwig",
    year: "2019",
  },
  {
    title: "Isle of Dogs",
    director: "Wes Anderson",
    year: "2018",
  },
  {
    title: "Little Miss Sunshine",
    director: ["Valerie Faris", "Jonathan Dayton"],
    year: "2006",
  },
  {
    title: "The Apartment",
    director: "Billy Wilder",
    year: "1960",
  },
  {
    title: "Ikiru",
    director: "Kurosawa Akira",
    year: "1952",
  },
  {
    title: "Jojo Rabbit",
    director: "Taika Waititi",
    year: "2020",
  },
];

//Setup Logging
const accessLogStream = fs.createWriteStream(
  // create a write stream (in append mode)
  path.join(__dirname, "log.txt"), // a ‘log.txt’ file is created in root directory
  { flags: "a" }
);

// Enable morgan logging to 'log.txt'
app.use(morgan("combined", { stream: accessLogStream }));

// Routes all requests for static files
app.use(express.static("public")); //to the 'public' folder

// GET requests
app.get("/movies", (req, res) => {
  res.json(top10movies);
});

app.get("/", (req, res) => {
  res.send("Welcome to myFlix");
});

// listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack); // information about the error will be logged to the terminal, then logged in the console
  res.status(500).send("Something broke!");
});
