const mysql = require('mysql')

var node1 = mysql.createConnection({
    host: 'localhost',
    //host: 'a',
    user: 'root',
    password: 'root',
    database: 'node1'
});

node1.connect((err) => {
    if (err) {
        console.log("failed to connect to node1")
    } else {
        console.log('Connected to node1')
    }

    doQueryArray(node1, queries1).then(
        doQueryArray(node1, queries2)
    )

    console.log("done")
})

let queries1 = [
    "INSERT INTO movies_denormalized values(69420, \"a\", 1, \"a\",\"a\",\"a\")",
    "INSERT INTO movies_denormalized values(69422, \"a\", 1, \"a\",\"a\",\"a\")"
]

let queries2 = [
    "INSERT INTO movies_denormalized values(69423, \"a\", 1, \"a\",\"a\",\"a\")",
    "INSERT INTO movies_denormalized values(69424, \"a\", 1, \"a\",\"a\",\"a\")"
]

doQuery = (node, q) => {
    return new Promise ((resolve, reject) => {
        console.log(q)
        node.query(q, (err, result) => {
            resolve
        })
    })
}

doQueryArray = (node, queries) => {
    return new Promise ((resolve, reject) => {
        queries.forEach(async (q) => {
            doQuery(node, q)
        })

        resolve
    })
}