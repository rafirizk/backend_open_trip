const Router = require('express').Router()
const {ProductController} = require('../controllers')

Router.post('/add', ProductController.addProduct)
Router.get('/', ProductController.getProduct)
Router.post('/addPhoto', ProductController.addPhoto)
Router.get('/details/:id', ProductController.getProductDetails)

module.exports = Router