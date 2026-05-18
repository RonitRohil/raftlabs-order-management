function apiResponse(success, status_code, message, result = null) {
	return { success, status_code, message, result };
}

module.exports = apiResponse;