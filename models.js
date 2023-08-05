const mongoose = require("mongoose");

//Defining the Schemas
let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true },
});

let directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Birth: { type: String, required: true },
  Death: { type: String, required: true },
});

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Release: { type: String, required: true },
  Cast: [String],
  Genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
    required: true,
  },
  Director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Director",
    required: true,
  },
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  Favorite_movies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
  ],
});

//The Creation of the Models
let Genre = mongoose.model("Genre", genreSchema);
let Director = mongoose.model("Director", directorSchema);
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

//Exporting the Models
module.exports.Genre = Genre;
module.exports.Director = Director;
module.exports.Movie = Movie;
module.exports.User = User;