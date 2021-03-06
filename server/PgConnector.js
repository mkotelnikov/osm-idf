var Mosaic = require('mosaic-commons');
var _ = require('underscore');
var FS = require('fs');
var PG = require('pg.js')

module.exports = PgConnector;

/**
 * This class provides some utility methods allowing to query Postgres database
 * and return resulting JSON objects using promises.
 * 
 * @param options.url
 *            url of the Db connection
 */
function PgConnector(options) {
    var that = this;
    that.options = options || {};
    if (!that.options.url)
        throw new Error('DB connection URL is not defined');
}

_.extend(PgConnector.prototype, {

    /** Executes the specified query and returns a list of results - JSON objects */
    exec : function(options) {
        var that = this;
        return that._connect(function(client) {
            var params = options.params || [];
            var query = that._prepareQuery(options);
            return Mosaic.P.ninvoke(client, 'query', query, params).then(
                    function(result) {
                        return result.rows;
                    });
        });
    },

    /** Prepares the specified query based on the given parameters */
    _prepareQuery : function(options) {
        var query = options.query;
        var limit = +options.limit;
        var offset = +options.offset;
        if (this.options.log) {
            this.options.log('SQL: ' + query);
        }
        query = 'select * from (' + query + ') as data ';
        if (!isNaN(offset) && offset > 0) {
            query += ' offset ' + offset;
        }
        if (!isNaN(limit) && limit >= 0) {
            query += ' limit ' + limit;
        }
        return query;
    },

    /**
     * Opens connection to the Db and calls the specified action with the
     * connection
     */
    _connect : function(action) {
        var that = this;
        return Mosaic.P().then(function() {
            var deferred = Mosaic.P.defer();
            PG.connect(that.options.url, function(err, client, done) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                return Mosaic.P().then(function() {
                    return action(client);
                }).then(function(result) {
                    done();
                    return result;
                }).then(function(result) {
                    deferred.resolve(result);
                }, function(err) {
                    deferred.reject(err);
                });
            })
            return deferred.promise;
        })
    }
})
