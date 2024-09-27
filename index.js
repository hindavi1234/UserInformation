const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4: uuidv4} = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended:true }))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'sachin@123',
});

let getRandomUser = () => {
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}
// we are not doing connection.end() here becoz after the get request pass the 
// connection will automatically get end.

// /Home route
app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) AS count FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            const count = result[0].count;  // Correctly defining the count variable
            res.render("home.ejs", { count });  // Passing count to the EJS template
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
});

// show user
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
        //    console.log(result);
           res.render("showusers.ejs",{users});
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
});

// Edit Route
app.get("/user/:id/edit", (req,res) => {
    let {id} = req.params;//id ko nikalne ke liye
    let q = `SELECT * FROM user WHERE id='${id}'`
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
           let user = result[0];
           res.render("edit.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

// update (DB) route
app.patch("/user/:id", (req,res)=>{
    let {id} = req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
           if (err) throw err;
           let user = result[0];
           if(formPass != user.password)
           {
            res.send("WRONG password entered!");
           }
          else
          {
            let q2 = `update user set username = '${newUsername}' where id='${id}'`;
            connection.query(q2, (err,result) => {
                if(err) throw err;
                res.redirect("/user/");
            })
          }
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
});

// Add new user
app.get("/user/new", (req,res) => {
    res.render("new.ejs");
})

app.post("/user/new", (req,res) => {
    let {username, email,password} = req.body;
    let id = uuidv4();
    let q = `insert into user (id,username,email,password) values
             ('${id}', '${username}', '${email}', '${password}')`;
 
    try {
        connection.query(q,(err,result) => {
            if(err) throw err;
            console.log("added new user!!");
            res.redirect("/user/");
        })
    } catch (err) {
        console.log(err);
        res.send("Some error occurred in the DB");
    }
});

// delete User
app.get("/user/:id/delete", (req,res) => {
    let {id} = req.params;//id ko nikalne ke liye
    let q = `SELECT * FROM user WHERE id='${id}'`
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
           let user = result[0];
           res.render("delete.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
app.listen("8080", () => {
    console.log("Server listening to 8080");
});

