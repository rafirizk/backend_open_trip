const Router = require('express').Router()
const {TransactionsController} = require('../controllers')
const {auth} = require('../helpers/auth')

Router.post('/addCart',auth, TransactionsController.AddToCart)
Router.get('/cart', TransactionsController.getCart)
Router.post('/paidCC', auth, TransactionsController.CCPayment)
Router.post('/uploadPayment', auth, TransactionsController.PaymentReceiptUpload)
Router.put('/payment_approved', TransactionsController.PaymentApproved)
Router.put('/payment_rejected', TransactionsController.PaymentRejected)
Router.get('/payment_approval', TransactionsController.getAdminWaitingApproval)

module.exports = Router