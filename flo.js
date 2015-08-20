var flo = require('fb-flo'),
    fs = require('fs'),

    server = flo('dist/',
            {
                port: 8888,
                host: 'localhost',
                verbose: false,
                glob: ['**/*']
            },
            function(filepath, callback) {
                if (filepath.indexOf('db-journal') === -1) {
                    callback({
                        contents: fs.readFileSync('dist/' + filepath),
                        reload: true
                    });
                }
            });

server.once('ready', function() {
    console.log('Ready for fb-flo.');
});
