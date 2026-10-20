// Error from the backend. Same shape as Laravel:
// message = main message, errors = { fieldName: ['message'] }
export class ApiError extends Error {
  constructor(message, errors = {}, status = 422) {
    super(message);
    this.errors = errors;
    this.status = status;
  }

  // First error for one field, e.g. err.field('email')
  field(name) {
    return this.errors?.[name]?.[0];
  }
}

export function fail(field, message) {
  throw new ApiError(message, { [field]: [message] });
}
