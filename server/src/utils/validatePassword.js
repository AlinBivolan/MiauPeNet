const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

module.exports = validatePassword;