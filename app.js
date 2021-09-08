const express = require("express")
const elasticsearch = require("elasticsearch")
const app = express()
app.use(express.json())


const esClient = elasticsearch.Client({
    host: "http://127.0.0.1:9200",
})


app.post("/products", (req, res) => {
    esClient.index({
        index: 'product',
        body: {
            "debit_account": req.body.debit_account,
            "credit_account": req.body.credit_account,
            "amount": req.body.amount,
        }
    })
    .then(response => {
        return res.json({"message": "Indexing successful"})
    })
    .catch(err => {
         return res.status(500).json({"message": "Error"})
    })
})


app.get("/products", async (req, res) => {
const result = []
const query = {
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "debit_account": req.query.from
            }
          },
          {
            "bool": {
              "should": [
               
                {
                  "match": {
                    "credit_account": req.query.to
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
  const query2 = {
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "debit_account": req.query.to
            }
          },
          {
            "bool": {
              "should": [
               
                {
                  "match": {
                    "credit_account": req.query.from
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }

const res2 = await esClient.search({ index: 'product', body: query});

        let i = 0
        for (transaction of res2.hits.hits) {
            //console.log(transaction)
            if (transaction._source.debit_account === req.query.from) {
                
                
                res2.hits.hits[i]._source.type = 'emissor'
                
                
            } else {
                res2.hits.hits[i]._source.type = 'receptor'
                
            }

           result.push(res2.hits.hits[i]._source)
           i++
        }
        const res3 = await esClient.search({ index: 'product', body: query2});

        let a = 0
        for (transaction of res3.hits.hits) {
            console.log(transaction)
            if (transaction._source.debit_account === req.query.from) {
                
                
                res3.hits.hits[a]._source.type = 'emissor'
                
                
            } else {
                res3.hits.hits[a]._source.type = 'receptor'
                
            }

           result.push(res3.hits.hits[a]._source)
           a++
        }    

return res.json(result)

  //  const result = []
    const from = req.query.from
    const to = req.query.to
    esClient.search({
        index: "product",
        body: {
            query: {
                match: {"debit_account": from},
                match: {"credit_account": to}
            }
        }
    })
    .then(response => {
        let i = 0
        for (transaction of response.hits.hits) {
            console.log(transaction)
            if (transaction._source.debit_account === req.query.from) {
                
                
                response.hits.hits[i]._source.type = 'emissor'
                
                
            } else {
                response.hits.hits[i]._source.type = 'receptor'
                
            }

           result.push(response.hits.hits[i]._source)
           i++
        }

        
    })
    .catch(err => {
        console.error(err)
        return res.status(500).json({"message": "Error"})
    })
    console.log(result)
    console.log('========')
 // second request
    esClient.search({
        index: "product",
        body: {
            query: {
                match: {"debit_account": to},
                match: {"credit_account": from}
            }
        }
    })
    .then(response => {
        let i = 0
        for (transaction of response.hits.hits) {
            if (transaction._source.debit_account === req.query.from) {
                
                
                response.hits.hits[i]._source.type = 'emissor'
                
                
            } else {
                response.hits.hits[i]._source.type = 'receptor'
                
            }

           result.push(response.hits.hits[i]._source)
           i++
        }
        console.log(result)
        return res.json(result)
    })
    .catch(err => {
        console.error(err)
        return res.status(500).json({"message": "Error"})
    })
})

app.listen(process.env.PORT || 3001, () => {
    console.log("connected")
})