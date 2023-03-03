// Setup
const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({ type: 'text/csv' }));
app.use(express.static(__dirname + "/public"));

// Database setup
const Database = require('better-sqlite3');
const db = new Database('database/poc.db', { fileMustExist: true });

// Bulk Upload Setup
const { parse } = require('csv-parse/sync');

// Routes
app.get("/", function(req, res){
  console.log("Home requested");
  res.render("home");
});

app.post("/search", function(req, res){
  console.log("Search request posted");

  const searchName = req.body.searchName;

  const findVols = db.prepare("SELECT id, fname, lname FROM volunteers WHERE fname || ' ' || lname LIKE ? ORDER BY fname ASC");
  const findStus = db.prepare("SELECT id, fname, lname FROM students WHERE fname || ' ' || lname LIKE ? ORDER BY fname ASC");

  const volNames = findVols.all(`%${searchName}%`); // array of objects
  const stuNames = findStus.all(`%${searchName}%`);

  // console.table(volNames);
  // console.table(stuNames);

  res.render("search", {searchName: searchName, volNames: volNames, stuNames: stuNames});

});

app.post("/profile", function(req, res){
  console.log("Profile request posted");

  const type = req.body.type;
  const id = req.body.id;

  let getProfile;
  let getRels;

  if (type === "vol") {
    getProfile = db.prepare("SELECT * FROM volunteers WHERE id = ?");
    getRels = db.prepare("SELECT student_id, stage, fname, lname FROM relationships JOIN students ON relationships.student_id = students.id WHERE relationships.mentor_id = ?");
  } else if (type === "stu") {
    getProfile = db.prepare("SELECT * FROM students WHERE id = ?");
    getRels = db.prepare("SELECT mentor_id, stage, fname, lname FROM relationships JOIN volunteers ON relationships.mentor_id = volunteers.id WHERE relationships.student_id = ?");
  }

  const profile = getProfile.get(id);
  const rels = getRels.all(id);

  if (profile.is_active === 1) {
    profile.is_active = "ACTIVE"
  } else {
    profile.is_active = "INACTIVE"
  }

  switch (profile.is_graduated) {
    case undefined:
      break;
    case 1:
      profile.is_graduated = "Graduated";
      break;
    case 0:
      profile.is_graduated = "In_school";
      break;
  }

  res.render(`${type}-profile`, {profile: profile, rels: rels});

});

app.get("/add-volunteer", function(req, res){
  console.log("Add volunteer form requested");
  res.render("add-volunteer");
});

app.post("/add-volunteer", function(req, res){
  console.log("Add volunteer request posted");
  
  const newProfile = req.body;
  let msg = "Oops! Something went wrong with the data you sent.";

  addPerson = db.prepare("INSERT INTO volunteers (fname, lname, phone, email, street, city, usstate, church, location, team, notes, is_active) VALUES (@fname, @lname, @phone, @email, @street, @city, @usstate, @church, @location, @team, @notes, @is_active)");
  const result = addPerson.run(newProfile);

  if (Object.keys(result).length === 2) {
    msg = "Person successfully added!";
  } else {
    msg = "Oops! Something went wrong, and the person was not added.";
  }

  res.render("upload", {msg: msg});
});

app.get("/add-student", function(req, res){
  console.log("Add student form requested");
  res.render("add-student");
});

app.post("/add-student", function(req, res){
  console.log("Add student request posted");
  
  const newProfile = req.body;
  let msg = "Oops! Something went wrong with the data you sent.";

  addPerson = db.prepare("INSERT INTO students (fname, lname, phone, email, street, city, usstate, church, school, location, team, notes, is_active, is_graduated) VALUES (@fname, @lname, @phone, @email, @street, @city, @usstate, @church, @school, @location, @team, @notes, @is_active, @is_graduated)");
  const result = addPerson.run(newProfile);

  if (Object.keys(result).length === 2) {
    msg = "Person successfully added!";
  } else {
    msg = "Oops! Something went wrong, and the person was not added.";
  }

  res.render("upload", {msg: msg});

});

app.post("/edit-profile", function(req, res){
  console.log("Edit profile form requested");

  const type = req.body.type;
  const id = req.body.id;

  let getProfile;
  if (type === "vol") {
    getProfile = db.prepare("SELECT * FROM volunteers WHERE id = ?");
  } else if (type === "stu") {
    getProfile = db.prepare("SELECT * FROM students WHERE id = ?");
  }

  const profile = getProfile.get(id);

  res.render(`edit-${type}`, {profile: profile});

});

app.post("/edit-profile-submission", function(req, res){
  console.log("Edit volunteer request posted");
  
  const edit = req.body;
  let updatePerson;

  if (edit.type === "vol") {
    updatePerson = db.prepare("UPDATE volunteers SET fname = @fname, lname = @lname, phone = @phone, email = @email, street = @street, city = @city, usstate = @usstate, church = @church, location = @location, team = @team, notes = @notes, is_active = @is_active WHERE id = @id");
  } else if (edit.type === "stu") {
    updatePerson = db.prepare("UPDATE students SET fname = @fname, lname = @lname, phone = @phone, email = @email, street = @street, city = @city, usstate = @usstate, church = @church, school = @school, location = @location, team = @team, notes = @notes, is_active = @is_active, is_graduated = @is_graduated WHERE id = @id");
  }

  const result = updatePerson.run(edit);

  if (Object.keys(result).length === 2) {
    msg = "Update successful!";
  } else {
    msg = "Oops! Something went wrong, and the update failed.";
  }

  res.render("upload", {msg: msg});

});

app.get("/new-rel", function(req, res){
  console.log("New relationship request.");
  res.render("add-rel");
});

app.post("/search-for-rel", function(req, res){
  console.log("Names searched for new relationship.");

  const volName = req.body.volName;
  const stuName = req.body.stuName;

  const findVols = db.prepare("SELECT id, fname, lname FROM volunteers WHERE fname || ' ' || lname LIKE ? ORDER BY fname ASC");
  const findStus = db.prepare("SELECT id, fname, lname FROM students WHERE fname || ' ' || lname LIKE ? ORDER BY fname ASC");

  const volNames = findVols.all(`%${volName}%`);
  const stuNames = findStus.all(`%${stuName}%`);

  if (volNames.length === 0 || stuNames.length === 0){
    res.render("upload", {msg: "Oops! That search came up empty. Please try again."});
  } else {
    res.render("confirm-rel", {volNames: volNames, stuNames: stuNames});
  }

});

app.post("/submit-rel", function(req, res){
  console.log("New relationship submitted");

  const newRel = req.body;

  let msg = "Oops! Something went wrong with the data you sent.";

  const addRel = db.prepare("INSERT INTO relationships (mentor_id, student_id, stage) VALUES (@vol_id, @stu_id, @stage)");
  const result = addRel.run(newRel);
  
  if (Object.keys(result).length === 2) {
    msg = "Relationship successfully added!";
  } else {
    msg = "Oops! Something went wrong, and the update failed.";
  }

  res.render("upload", {msg: msg});
});

app.post("/edit-rel", function(req, res){
  console.log("Edit relationship form request.");

  const rel_req = req.body;

  pullRel = db.prepare("SELECT volunteers.fname || ' ' || volunteers.lname AS volName, students.fname || ' ' || students.lname AS stuName, mentor_id AS vol_id, student_id AS stu_id, stage FROM volunteers JOIN relationships ON volunteers.id = relationships.mentor_id JOIN students ON relationships.student_id = students.id WHERE mentor_id = @vol_id AND student_id = @stu_id");
  rel = pullRel.get(rel_req);

  res.render("edit-rel", {rel: rel});

});

app.post("/submit-edit-rel", function(req, res){
  console.log("Edit relationship confirmed.");

  const update = req.body;

  let updateRel;
  if (update.stage === "REMOVE") {
    updateRel = db.prepare("DELETE FROM relationships WHERE mentor_id = @vol_id AND student_id = @stu_id");
  } else {
    updateRel = db.prepare("UPDATE relationships SET stage = @stage WHERE mentor_id = @vol_id AND student_id = @stu_id");
  }

  const result = updateRel.run(update);

  let msg;
  if (Object.keys(result).length === 2) {

    if (update.stage === "REMOVE") {
      msg = "Relationship successfully removed.";
    } else {
      msg = `Relationship stage succesfully updated to "${update.stage}"!`;
    }

  } else {
    msg = "Oops! Something went wrong, and the update failed.";
  }

  res.render("upload", {msg: msg});
});

app.get("/bulk", function(req, res){
  console.log("Bulk upload form requested.")
  res.render("bulk");
});

app.post("/bulk-upload", function(req, res){
  console.log("Bulk upload submitted.");

  csv = req.body.csv;
  type = req.body.type;

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true
  });
  console.table(records);

  let insOne;
  let msg;
  if (type === "vol") {
    insOne = db.prepare("INSERT INTO volunteers (fname, lname, phone, email, street, city, usstate, church, location, team, notes, is_active) VALUES (@fname, @lname, @phone, @email, @street, @city, @usstate, @church, @location, @team, @notes, @is_active)");
    msg = `Successfully uploaded ${req.body.upload} into the Volunteers list!`;
  } else if (type === "stu") {
    insOne = db.prepare("INSERT INTO students (fname, lname, phone, email, street, city, usstate, church, school, location, team, notes, is_active, is_graduated) VALUES (@fname, @lname, @phone, @email, @street, @city, @usstate, @church, @school, @location, @team, @notes, @is_active, @is_graduated)");
    msg = `Successfully uploaded ${req.body.upload} into the Students list!`;
  }

  const insMany = db.transaction((people) => {
    for (const person of people) insOne.run(person);
  });
  
  insMany(records);

  res.render("upload", {msg: msg});
});

app.post("/delete-profile", function(req, res){
  console.log("Delete profile requested");

  const type = req.body.type;
  const id = req.body.id;

  if (type === "vol") {
    delProf = db.prepare("DELETE FROM volunteers WHERE id = ?");
  } else if (type === "stu") {
    delProf = db.prepare("DELETE FROM students WHERE id = ?");
  }

  const result = delProf.run(id);

  let msg;
  if (Object.keys(result).length === 2) {
    msg = "Deletion successful!";
  } else {
    msg = "Oops! Something went wrong, and the deletion failed.";
  }

  res.render("upload", {msg: msg});

});

// Server
app.listen(port, function(){
    console.log(`Server running on ${port}!`)
});