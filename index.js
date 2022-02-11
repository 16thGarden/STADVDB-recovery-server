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
    node1: {
        //host: 'us-cdbr-east-05.cleardb.net',
        host: 'a',
        user: 'b6a546b49b5f9a',
        password: '4469befb',
        database: 'heroku_4d478ba2b4e8562'
    },
    node2: {
        //host: 'us-cdbr-east-05.cleardb.net',
        host: 'a',
        user: 'b030d6dfff505f',
        password: '6d157c81',
        database: 'heroku_2dc4422a8802044'
    },
    node3: {
        //host: 'us-cdbr-east-05.cleardb.net',
        host: 'a',
        user: 'bec9842212802f',
        password: 'ee599e7b',
        database: 'heroku_362b679429ad586'
    },
}

showtime = () => {
    var currentdate = new Date(); 
    var datetime = "" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    console.log(datetime)
}

tablename = "movies_denormalized";

var node1
var node2
var node3

function handleDisconnectNode1() {
    showtime()
    node1 = mysql.createConnection(details.node1); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log('error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnectNode1, 5000);    
        } else {
            console.log('connected to node1');
        }                                          
    });                                            
                                               
    node1.on('error', function onError(err) {
        console.log('node1 error PROTOCOL_CONNECTION_LOST');
        showtime()
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode1();                         
        } else {
            console.log('throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode2() {
    showtime()
    node1 = mysql.createConnection(details.node1); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log('error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnectNode2, 5000);    
        } else {
            console.log('connected to node1');
        }                                          
    });                                            
                                               
    node1.on('error', function onError(err) {
        console.log('node1 error PROTOCOL_CONNECTION_LOST');
        showtime()
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode2();                         
        } else {
            console.log('throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode3() {
    showtime()
    node1 = mysql.createConnection(details.node1); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log('error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnectNode3, 5000);    
        } else {
            console.log('connected to node1');
        }                                          
    });                                            
                                               
    node1.on('error', function onError(err) {
        console.log('node1 error PROTOCOL_CONNECTION_LOST');
        showtime()
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode3();                         
        } else {
            console.log('throwed err');                        
            throw err;                                  
        }
    });
}

handleDisconnectNode1();
handleDisconnectNode2();
handleDisconnectNode3();

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