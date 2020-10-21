const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const schedule = require('node-schedule')
require('dotenv').config()

app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static('public'))

const PORT = process.env.PORT || 8000

const {
    AuthRoutes,
    ProductRoutes,
    TransactionRoute
} = require('./src/routes')

app.use('/auth', AuthRoutes)
app.use('/product', ProductRoutes)
app.use('/transaction', TransactionRoute)

app.get('/', (req, res) => {
    res.status(200).send('Berhasil')
})

// schedule.scheduleJob('*/2 * * * * *', function(firedate){
//     console.log('Nyala' + firedate)
// })

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})