/** @format */
"use client";

/**
 * API debugging utilities to help troubleshoot API issues
 */

/**
 * Log API request details before sending
 * @param {string} url - The API URL
 * @param {Object} options - Request options
 * @param {Object|null} body - Request body (if applicable)
 */
export const logApiRequest = (url, options, body = null) => {
  if (process.env.NODE_ENV !== "development") return;

  console.group("API Request");
  console.log("URL:", url);
  console.log("Method:", options.method);
  console.log("Headers:", options.headers);
  if (body) {
    console.log("Body:", body);
  }
  console.groupEnd();
};

/**
 * Log API response details
 * @param {Response} response - The fetch Response object
 * @param {Object|null} data - Parsed response data (if available)
 */
export const logApiResponse = async (response, data = null) => {
  if (process.env.NODE_ENV !== "development") return;

  let responseData = data;
  if (
    !responseData &&
    response.headers.get("content-type")?.includes("application/json")
  ) {
    try {
      // Clone the response to avoid consuming it
      const clonedResponse = response.clone();
      responseData = await clonedResponse.json();
    } catch (e) {
      responseData = "Could not parse JSON response";
    }
  }

  console.group("API Response");
  console.log("Status:", response.status, response.statusText);
  console.log("Headers:", Object.fromEntries([...response.headers.entries()]));
  console.log("Body:", responseData);
  console.groupEnd();
};

/**
 * Compare object structures to identify missing or mismatched fields
 * @param {Object} expected - The expected structure
 * @param {Object} actual - The actual object to compare
 * @returns {Object} - An object with differences
 */
export const compareStructures = (expected, actual) => {
  const differences = {
    missing: [],
    mismatched: [],
  };

  Object.keys(expected).forEach((key) => {
    if (!(key in actual)) {
      differences.missing.push(key);
    } else if (typeof expected[key] !== typeof actual[key]) {
      differences.mismatched.push({
        key,
        expectedType: typeof expected[key],
        actualType: typeof actual[key],
      });
    } else if (
      typeof expected[key] === "object" &&
      expected[key] !== null &&
      actual[key] !== null
    ) {
      // Recursively check nested objects
      const nestedDifferences = compareStructures(expected[key], actual[key]);
      if (nestedDifferences.missing.length > 0) {
        differences.missing.push(
          ...nestedDifferences.missing.map((k) => `${key}.${k}`)
        );
      }
      if (nestedDifferences.mismatched.length > 0) {
        differences.mismatched.push(
          ...nestedDifferences.mismatched.map((diff) => ({
            key: `${key}.${diff.key}`,
            expectedType: diff.expectedType,
            actualType: diff.actualType,
          }))
        );
      }
    }
  });

  return differences;
};

/**
 * Extract validation errors from .NET API responses
 * @param {Object} errorResponse - The error response from the API
 * @returns {Object} - Formatted validation errors
 */
export const extractValidationErrors = (errorResponse) => {
  const validationErrors = {};

  if (!errorResponse) return validationErrors;

  // Handle .NET validation error format
  if (errorResponse.errors && typeof errorResponse.errors === "object") {
    Object.entries(errorResponse.errors).forEach(([field, messages]) => {
      validationErrors[field] = Array.isArray(messages) ? messages : [messages];
    });
  }

  // Handle generic error message
  if (errorResponse.message || errorResponse.Message) {
    validationErrors.general = [errorResponse.message || errorResponse.Message];
  }

  // Handle error property
  if (errorResponse.error || errorResponse.Error) {
    if (!validationErrors.general) {
      validationErrors.general = [];
    }
    validationErrors.general.push(errorResponse.error || errorResponse.Error);
  }

  return validationErrors;
};
