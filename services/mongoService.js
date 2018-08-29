((mongoService, mongodb) => {

    const url = "mongodb://localhost:27017";
    const dbName = "paypaltesting";

    var Connect = (cb) => {
        mongodb.connect(url, { useNewUrlParser: true }, (err, client) => {
            return cb(err, client.db(dbName), () => {
                client.close();
            });
        });
    };

    mongoService.Create = (colName, createObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).insertOne(createObj, (err, result) => {
                cb(err, result);
                return close();
            })
        });
    };

    mongoService.Read = (colName, readObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).find(readObj).toArray((err, results) => {
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Update = (colName, findObj, updateObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).updateOne(findObj, updateObj, (err, results) => {
                cb(err, results);
                return close();
            });
        });
    };

    mongoService.Delete = (colName, findObj, cb) => {
        Connect((err, db, close) => {
            db.collection(colName).remove(findObj, (err) => {
                cb(err);
                return close();
            });
        });
    };
})
    (
    module.exports,
    require('mongodb')
    )