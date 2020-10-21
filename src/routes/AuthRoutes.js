const Router = require('express').Router()
const {AuthController} = require('../controllers')
// const {auth} = require('../helpers/auth')

Router.post('/register', AuthController.register)
Router.post('/login', AuthController.login)
// Router.post('/sendVerification', AuthControllers.sendVerification)
// Router.get('/verification', auth, AuthControllers.verification)
Router.get('/keepLogin/:id', AuthController.keepLogin)

module.exports = Router