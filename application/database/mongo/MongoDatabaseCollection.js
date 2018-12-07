module.exports = class MongoDatabaseCollection {

    constructor(mongoCollection) {
        this.collection = mongoCollection;
    }

    createDocument(document, callback) {
        this.collection.insertOne(document, callback);
    }

    findDocuments(query, projection) {
        return this.collection.find(query, projection);
    }

    findDocument(query, projection, callback) {
        return this.collection.findOne(query, projection, callback);
    }

    updateDocument(query, update, callback) {
        this.collection.updateOne(query, update, callback);
    }

    deleteDocument() {

    }

}
