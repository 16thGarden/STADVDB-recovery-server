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

hostname = 'us-cdbr-east-05.cleardb.net'

details = {
    node1: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'b6a546b49b5f9a',
        password: '4469befb',
        database: 'heroku_4d478ba2b4e8562'
    },
    node2: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'b030d6dfff505f',
        password: '6d157c81',
        database: 'heroku_2dc4422a8802044'
    },
    node3: {
        host: 'us-cdbr-east-05.cleardb.net',
        //host: 'a',
        user: 'bec9842212802f',
        password: 'ee599e7b',
        database: 'heroku_362b679429ad586'
    },
}

gettime = () => {
    var currentdate = new Date(); 
    var datetime = "" + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime + "\t=>\t"
}

tablename = "movies_denormalized";

var node1
var node2
var node3

function handleDisconnectNode1() {
    node1 = mysql.createConnection(details.node1); 
    node1.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node1, trying again in 5secs...');
            setTimeout(handleDisconnectNode1, 5000);    
        } else {
            console.log(gettime() + 'connected to node1');
        }                                          
    });                                            
                                               
    node1.on('error', function onError(err) {
        console.log(gettime() + 'node1 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode1();                         
        } else {
            console.log(gettime() + 'throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode2() {
    node2 = mysql.createConnection(details.node2); 
    node2.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node2, trying again in 5secs...');
            setTimeout(handleDisconnectNode2, 5000);    
        } else {
            console.log(gettime() + 'connected to node2');
        }                                          
    });                                            
                                               
    node2.on('error', function onError(err) {
        console.log(gettime() + 'node2 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode2();                         
        } else {
            console.log(gettime() + 'throwed err');                        
            throw err;                                  
        }
    });
}

function handleDisconnectNode3() {
    node3 = mysql.createConnection(details.node3); 
    node3.connect( function onConnect(err) {  
        if (err) {                                  
            console.log(gettime() + 'error when connecting to node3, trying again in 5secs...');
            setTimeout(handleDisconnectNode3, 5000);    
        } else {
            console.log(gettime() + 'connected to node3');
        }                                          
    });                                            
                                               
    node3.on('error', function onError(err) {
        console.log(gettime() + 'node3 error PROTOCOL_CONNECTION_LOST');
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnectNode3();                         
        } else {
            console.log(gettime() + 'throwed err');                        
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
    history.reverse()
    res.render('history', {
        title: "history",
        history: history
    })
    history.reverse()
})

app.get('/addToHistory', function(req, res) {
    node = req.query.node
    q = req.query.query

    q.replaceAll("%20", " ")
    q.replaceAll("%22", "\"")
    q.replaceAll("%3E", ">")

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

app.get('/simulate', function(req, res) {
    status1 = details.node1.host != 'a' ? "green" : "red"
    status2 = details.node2.host != 'a' ? "green" : "red"
    status3 = details.node3.host != 'a' ? "green" : "red"
    res.render('simulate', {
        status1: status1,
        status2: status2,
        status3: status3,
    })
})

const fetch = require('node-fetch')
var destNode1 = 'https://database-node1.herokuapp.com/updateDetails'
var destNode2 = 'https://database-node2.herokuapp.com/updateDetails'
var destNode3 = 'https://database-node3.herokuapp.com/updateDetails'
broadcastDetailsUpdate = () => {
    var hostnameNode1 = details.node1.host
    var hostnameNode2 = details.node2.host
    var hostnameNode3 = details.node3.host

    var url1 = `${destNode1}?hostname1=${hostnameNode1}&hostname2=${hostnameNode2}&hostname3=${hostnameNode3}`
    var url2 = `${destNode2}?hostname2=${hostnameNode1}&hostname2=${hostnameNode2}&hostname3=${hostnameNode3}`
    var url3 = `${destNode3}?hostname3=${hostnameNode1}&hostname2=${hostnameNode2}&hostname3=${hostnameNode3}`

    fetch(url1)
    fetch(url2)
    fetch(url3)
}

app.post('/toggle', function(req, res) {
    node = req.body.node

    if (node == 1) {
        if (details.node1.host == 'a') {
            details.node1.host = hostname
        } else {
            details.node1.host = 'a'
        }
    } else if (node == 2) {
        if (details.node2.host == 'a') {
            details.node2.host = hostname
        } else {
            details.node2.host = 'a'
        }
    } else if (node == 3) {
        if (details.node3.host == 'a') {
            details.node3.host = hostname
        } else {
            details.node3.host = 'a'
        }
    }
    broadcastDetailsUpdate()
    res.send()
})

app.get('/getdb', function(req, res) {
    res.send(details)
})