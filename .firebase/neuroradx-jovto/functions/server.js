const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrneuroradxjovto = onRequest({"region":"europe-west3","memory":"2GiB","minInstances":0}, (req, res) => server.then(it => it.handle(req, res)));
  