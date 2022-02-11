const express = require("express")
const path = require("path")
const exphandle = require("express-handlebars")
const handlebars = require("handlebars")
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

handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

const mysql = require('mysql');
const { sendStatus } = require("express/lib/response");
const { query } = require("express");
const { send } = require("process");
details = {
    /*
    node1: {
        //host: 'us-cdbr-east-05.cleardb.net',
        host: 'a',
        user: 'b6a546b49b5f9a',
        password: '4469befb',
        database: 'heroku_4d478ba2b4e8562'
    },
    */
    node1: {
        host: 'localhost',
        //host: 'a',
        user: 'root',
        password: 'root',
        database: 'node1'
    },
    node2: {
        host: 'localhost',
        //host: 'a',
        user: 'root',
        password: 'root',
        database: 'node2'
    },
    node3: {
        host: 'localhost',
        //host: 'a',
        user: 'root',
        password: 'root',
        database: 'node3'
    }
}

var node1 = mysql.createConnection(details.node1);
var node2 = mysql.createConnection(details.node2);
var node3 = mysql.createConnection(details.node3);

node1.on('error', (err) => {
    console.log(err)
    node1 = mysql.createConnection(details.node1)
    node1.connect((err) => {
        if (err) {
            console.log("failed to connect to node1")
        } else {
            console.log('Connected to node1')
        }
    })
})
node2.on('error', (err) => {
    console.log(err)
    node2 = mysql.createConnection(details.node2)
    node2.connect((err) => {
        if (err) {
            console.log("failed to connect to node2")
        } else {
            console.log('Connected to node2')
        }
    })
})
node3.on('error', (err) => {
    console.log(err)
    node3 = mysql.createConnection(details.node3)
    node1.connect((err) => {
        if (err) {
            console.log("failed to connect to node3")
        } else {
            console.log('Connected to node3')
        }
    })
})

node1.connect((err) => {
    if (err) {
        console.log("failed to connect to node1")
    } else {
        console.log('Connected to node1')
    }
})
node2.connect((err) => {
    if (err) {
        console.log("failed to connect to node2")
    } else {
        console.log('Connected to node2')
    }
})
node3.connect((err) => {
    if (err) {
        console.log("failed to connect to node3")
    } else {
        console.log('Connected to node3')
    }
})

queries1 = []
queries2 = []
queries3 = []
history = []

updateSingle = (node, q) => {
    return new Promise((resolve, reject) => {
        node.query(q, (err, result) => {
            if (err) {
                resolve(true)
            }

            resolve(false)
        })
    })
}

updateSingleAsync = async (node, q) => {
    return await updateSingle(node, q)
}

app.get('/', function(req, res) {
    res.render('home.hbs', {
        title: "home",
        queries1: queries1,
        queries2: queries2,
        queries3: queries3,
    })
})

app.get('/addToQueue', function(req, res) {
    node = req.query.node
    q = req.query.query

    if (node == 1) {
        queries1.push(q)
    } else if (node == 2) {
        queries2.push(q)
    } else if (node == 3) {
        queries3.push(q)
    }

    res.send({
        success: true
    })
})

app.post('/update', function(req, res) {
    nodeNumber = req.body.node

    if (nodeNumber == 1) {
        updateSingleAsync(node1, queries1[0]).then(error => {
            if (!error) {
                history.push({
                    time: (new Date).getTime(),
                    node: 1,
                    query: queries1[0],
                    type: "recovery"
                })
                queries1.shift()
            }

            res.send({
                error: error
            })
        })
    } else if (nodeNumber == 2) {
        updateSingleAsync(node2, queries2[0]).then(error => {
            if (!error) {
                history.push({
                    time: (new Date).getTime(),
                    node: 2,
                    query: queries2[0],
                    type: "recovery"
                })
                queries2.shift()
            }

            res.send({
                error: error
            })
        })
    } else if (nodeNumber == 3) {
        updateSingleAsync(node3, queries3[0]).then(error => {
            if (!error) {
                history.push({
                    time: (new Date).getTime(),
                    node: 3,
                    query: queries3[0],
                    type: "recovery"
                })
                queries3.shift()
            }

            res.send({
                error: error
            })
        })
    }
})

app.get('/history', function(req, res) {
    res.render('history', {
        title: "history",
        history: history
    })
})

app.get('/addToHistory', function(req, res) {
    node = req.query.node
    q = req.query.query

    history.push({
        time: (new Date).getTime(),
        node: node,
        query: q,
        type: "normal"
    })

    res.send({
        success: true
    })
})