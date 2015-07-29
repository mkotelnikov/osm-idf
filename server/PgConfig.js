var FS = require('fs');
var Path = require('path');

module.exports = {
    getDbConfig : function(profile) {
        var dir = '../.config-db/';
        var host = readFile(dir + 'db.host', 'localhost');
        var user = readFile(dir + 'db.user', 'postgres');
        var port = readFile(dir + 'db.port', '5432');
        var password = readFile(dir + 'db.pass', 'postgres');
        var dbname = readFile(dir + 'db.name', 'postgres');
        return {
            host : host,
            port : port,
            user : user,
            password : password,
            dbname : dbname
        };
    }
};

function readFile(name, defaultValue) {
    var file = Path.resolve(__dirname, name);
    var content = defaultValue;
    try {
        content = FS.readFileSync(file, 'UTF-8') || defaultValue;
    } catch (err) {
    }
    content = content || defaultValue;
    content = content.replace(/^[\s\r\n]*|[\s\r\n]$/gim, '');
    return content;
}