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

const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: {origin: '*'}})
server.listen(3000, () => {
    console.log('socket server running...')
})

const mysql = require('mysql');
const { sendStatus } = require("express/lib/response");
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

doQuery = (node, q) => {
    return new Promise ((resolve, reject) => {
        console.log(q)
        node.query(q, (err, result) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

doQueryArray = (node, queries) => {
    return new Promise ((resolve, reject) => {
        var error = false
        queries.forEach(async (q) => {
            if(doQuery(node, q) == false) {
                error = true
            }
        })

        resolve(error)
    })
}

clearQueryArray = (node, error) => {
    return new Promise ((resolve, reject) => {
        if (node == 1 && !error) {
            queries1 = []
        } else if (node == 2 && !error) {
            queries2 = []
        } else if (node == 3 && !error) {
            queries3 = []
        }

        resolve()
    })
}

queries1 = []
queries2 = []
queries3 = []

app.get('/', function(req, res) {
    res.render('home.hbs', {
        title: "home",
        queries1: queries1,
        queries2: queries2,
        queries3: queries3,
    })
})

io.on('connection', (socket) => {
    console.log(`user connected: ${socket.id}`)

    app.get('/addToQueue', function(req, res) {
        node = req.query.node
        query = req.query.query
    
        if (node == 1) {
            queries1.push(query)
        } else if (node == 2) {
            queries2.push(query)
        } else if (node == 3) {
            queries3.push(query)
        }
    
        io.emit('message', {node: node, query: query})

        res.send({
            success: true
        })
    })
})

app.post('/updatedatabases', function(req, res) {
    var error1, error2, error3
    error1 = doQueryArray(node1, queries1).then(
        error2 = doQueryArray(node2, queries2).then(
            error3 = doQueryArray(node3, queries3).then(
                clearQueryArray(1, error1).then(
                    clearQueryArray(2, error2).then(
                        clearQueryArray(3, error3).then(
                            res.send({
                                error1: error1,
                                error2: error2,
                                error3: error3,
                            })
                        )
                    )
                )
            )
        )
    )
})