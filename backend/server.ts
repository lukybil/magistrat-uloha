import http from 'http';
import rest from './app';

const port = process.env.PORT || 3000;
rest.set('port', port);

const server = http.createServer(rest);
server.listen(port);

// "prebuild": "tslint -c tslint.json -p tsconfig.json --fix",