import ApiError from "../utils/ApiError.js";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map(
        (issue) => `${issue.path.join(".") || source}: ${issue.message}`
      );
      return next(new ApiError(400, "Validation failed", details));
    }

    if (source === "query") {
      // req.query is a read-only getter in Express 5, so expose parsed values separately.
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
};