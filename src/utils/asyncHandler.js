/**
 * AsyncHandler is an Express middleware function that wraps a Promise-based function in a try/catch block.
 * @param {function} fn - The Promise-based function to wrap. 
 * @returns {function} - The wrapped function.
 */
function asyncHandler(fn) {
  return function wrappedAsyncHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
