import ApiError from "../utils/ApiError.js";

export const validate = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => d.message);
      return next(ApiError.badRequest("Validation failed", details));
    }
    req.body = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => d.message);
      return next(ApiError.badRequest("Invalid query parameters", details));
    }
    req.query = value;
    next();
  };
};
