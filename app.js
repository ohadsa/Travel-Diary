//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const fs = require('fs');
app.use(express.static('public'));
var flag = false;



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/travelBlogDB", {
  useNewUrlParser: true
});

const itemSchema = {
  country: String,
  description: String,
  images: [String]
};
const Item = mongoose.model("Item", itemSchema);


app.get("/", function(req, res) {

  fs.readFile('defaultData.json', "utf8", function(error, data) {
    if (error) {
      console.error(error);
    }

    defaultItems = JSON.parse(data);
    Item.find({}, function(err, foundItems) {

      if (!flag && foundItems.length === 0) {
        flag = true;
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log("error adding default Items" + err);
          } else {
            console.log("Successfully saved default items to DB");
          }
        });

      } else {
        flag = true;
        res.render('homepage', {
          kindOfDay: "Today",
          listOfTasks: foundItems
        });
      }
    });

  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const description = req.body.description;
  const img = req.body.imageLink;

  console.log(itemName);
  if (itemName === "") {

    let alert = require('alert');
    alert("must provide country name !");

  } else {

    Item.findOne({
      country: itemName
    }, function(err, foundItem) {
      if (!err) {
        if (!foundItem) {

          const item = new Item({
            country: itemName,
            description: description,
            images: img
          });
          item.save();
          res.redirect("/");
        } else {
          let alert = require('alert');
          alert("country alredy exist !\n deleta the country to update");
        }
      }
    });
  }
});

app.post("/delete", function(req, res) {
  const id = req.body.checkBox;
  console.log(id);
  Item.findByIdAndRemove(id, function(err) {
    if (err) {
      console.log("error deleting  Items" + err);
    } else {
      console.log("Successfully delete  items to DB");
      res.redirect("/");
    }
  });
});

app.post("/details", function(req, res) {
  const id = req.body.checkBox;
  Item.findById(id, function(err, parm) {
    console.log(parm.country);
    if (err) {
      console.log("error showing  Items" + err);
    } else {
      res.render("details", {
        Country: parm.country,
        description: parm.description,
        relevatImage: parm.images,
        CountryId: parm._id
      });
    }
  });

});

app.post("/back", function(req, res) {
  res.redirect("/");
});

app.post("/addMoreImage", function(req, res) {
  const id = req.body.buttonCountry;
  const newImage = req.body.addImageLink;
  console.log(id);
  if (newImage === "") {
    let alert = require('alert');
    alert("not valid url link");
  } else {
    Item.findById(id, function(err, parm) {
      console.log(parm.country);
      if (err) {
        console.log("error showing  Items" + err);
      } else {
        parm.images.push(newImage);
        parm.save();
        res.render("details", {
          Country: parm.country,
          description: parm.description,
          relevatImage: parm.images,
          CountryId: parm._id
        });
      }
    });
  }
});





app.listen(3010, function() {
  console.log("Server started on port 30001");
});
