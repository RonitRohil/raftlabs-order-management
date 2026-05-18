/**
 * @param {0|1} success - 1 for success, 0 for failure
 * @param {number} status_code - HTTP status code
 * @param {string} message - Human-readable message
 * @param {object|null} result - Response payload
 */
function apiResponse(success, status_code, message, result = null) {
  return { success, status_code, message, result };
}

module.exports = apiResponse;
