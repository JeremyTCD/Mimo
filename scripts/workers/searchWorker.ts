// Based on https://github.com/webpack-contrib/worker-loader/issues/94
import SearchWorker = require('worker-loader!./search.worker');

export default SearchWorker;