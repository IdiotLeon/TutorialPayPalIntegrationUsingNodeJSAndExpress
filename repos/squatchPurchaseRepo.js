((squatchPurchaseRepo, paypal, ObjectID, mongoService, paymentService, subService) => {

    squatchPurchaseRepo.BuySingle = (purchaseName, purchasePrice, taxPrice, shippingPrice, itemCount, description, cb) => {

        var transactionArray = [];

        for (var i = 0; i < itemCount; i++) {
            var itemObj = paymentService.CreateItemObj(purchaseName, purchasePrice, 1);
            transactionArray.push(itemObj);
        }

        var transactionItemObj = [paymentService.CreateTransactionObj(taxPrice, shippingPrice, description, transactionArray)];

        paymentService.CreateWithPayPal(transactionItemObj, "http://localhost:8080/success", "http://localhost:8080/cancel", (err, results) => {
            if (err) {
                return cb(err);
            } else {
                return cb(null, results);
            }
        });
    };

    squatchPurchaseRepo.ExecuteOrder = (payerID, orderID, cb) => {
        paymentService.ExecutePayment(payerID, orderID, (err, response) => {
            return cb(err, response);
        });
    };

    squatchPurchaseRepo.CancelOrder = (orderID, cb) => {
        mongoService.Delete("paypal_orders", { _id: new ObjectID(orderID) }, (err, results) => {
            return cb(err, results);
        });
    };

    squatchPurchaseRepo.GetOrder = (orderID, cb) => {
        mongoService.Read("paypal_orders", { _id: new ObjectID(orderID) }, (err, paymentObj) => {
            if (err) {
                return cb(err);
            } else {
                paymentService.GetPayment(paymentObj[0].OrderDetails.id, (err, results) => {
                    return cb(err, results);
                });
            }
        });
    };

    squatchPurchaseRepo.RefundOrder = (orderID, cb) => {
        squatchPurchaseRepo.GetOrder(orderID, (err, order) => {
            if (err) {
                return cb(err)
            } else {
                var saleID = order.transactions[0].related_resources[0].sale.id;
                var refundPrice = Number(order.transactions[0].amount.total);

                paymentService.RefundPayment(saleID, refundPrice, (err, refund) => {
                    cb(err, refund);
                });
            }
        });
    };

})
    (
    module.exports,
    require('paypal-rest-sdk'),
    require('mongodb').ObjectId,
    require('../services/mongoService.js'),
    require('../services/paymentService.js')
    )
