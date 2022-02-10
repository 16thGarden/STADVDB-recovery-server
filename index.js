const express = require("express")
const path = require("path")
const exphandle = require("express-handlebars")
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser")

const app = express();
const port = process.env.PORT || 9000;

app.engine("hbs", engine({
    extname: "hbs",
    defaultView: "main",
    layoutsDir: path.join(__dirname, "/views/layouts"), // Layouts folder
    partialsDir: path.join(__dirname, "/views/partials"), // Partials folder
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
}))

app.set("view engine", "hbs")

app.use(express.static("public"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, function() {
    console.log("App listening at port "  + port);
});

app.post('/', function(req, res) {
    node = req.query.node
    query = req.query.query

    console.log(node + "\t" + query)

    res.send({
        success: true
    })
})