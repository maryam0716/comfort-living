// Express 5 made req.query and req.params read-only getters, which breaks
// xss-clean and express-mongo-sanitize (both try to reassign req.query
// wholesale — confirmed by testing, this crashes every request with
// "Cannot set property query of #<IncomingMessage> which has only a getter").
//
// This sanitizes req.body in place instead (still writable in Express 5),
// which covers the vast majority of real attack surface — every POST/PUT
// endpoint in this app reads from req.body, not req.query. It strips
// MongoDB operator keys (basic NoSQL injection prevention) and neutralizes
// <script> tags in string values (basic stored-XSS prevention).

function sanitizeValue(value) {
  if (typeof value === "string") {
    return value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  }
  return value;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    // Strip Mongo operator injection keys like "$where" or "a.b" dot-paths
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }

    if (obj[key] && typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    } else {
      obj[key] = sanitizeValue(obj[key]);
    }
  }
}

module.exports = function sanitizeRequestBody(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  next();
};
