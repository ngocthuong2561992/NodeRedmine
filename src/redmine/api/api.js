const config = require('../../../config');
const http = require("https");

class apiRedmine {
    constructor() {
        this.options = {
            host: config.redmine_url,
            path: "",
            port: config.redmine_port,
            method: 'GET',
            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
            headers: {
                'X-Redmine-API-Key': config.redmine_api,
                'Content-Type': 'application/json',
            }
        };
    }
    get(url, callback) {
        this.options.path = '/' + config.redmine_folder + '/' + url;
        //console.log(this.options);
        http.request(this.options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    callback(parsedData);
                } catch (e) {
                    console.error(e.message);
                    callback(rawData);
                }
            });
        }).end();
    }
}


module.exports = { apiRedmine };
