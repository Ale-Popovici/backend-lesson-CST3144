// middleware/logger.js
const logger = (req, res, next) => {
  const startTime = new Date();

  // Log the request
  console.log(`[${startTime.toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Query:", req.query);
  console.log("Body:", req.body);

  // Add response logging
  const oldSend = res.send;
  res.send = function (data) {
    console.log("Response:", data);
    console.log(`Response Time: ${new Date() - startTime}ms`);
    console.log("----------------------------------------");
    oldSend.apply(res, arguments);
  };

  next();
};

module.exports = logger;
