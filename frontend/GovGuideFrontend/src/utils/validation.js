export const validateEmail = (email) => {
  if (!email || email.trim() === "") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRole = (role) => {
  return role === "client" || role === "company";
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Password must be ≥8 chars and contain at least:
 * one uppercase, one lowercase, one digit, one special char (@ $ ! % * ? & . # _ -)
 */
export const validatePassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[@$!%*?&.#_\-]/.test(password)) return false;
  return true;
};

/**
 * Username: 3–30 chars, starts with a letter, letters/numbers/underscores only.
 */
export const validateUsername = (username) => {
  return /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username);
};

export const validateOtp = (otp) => {
  return otp.length === 6 && /^\d+$/.test(otp);
};

export const getValidationErrors = (formData, fields) => {
  const errors = {};

  fields.forEach((field) => {
    const value = formData[field.name];

    if (field.required && (!value || (typeof value === "string" && value.trim() === ""))) {
      errors[field.name] = "This field is required";
      return;
    }

    if (field.type === "email" && value) {
      if (!validateEmail(value)) {
        errors[field.name] = "Please enter a valid email (e.g., user@example.com)";
        return;
      }
    }

    if (field.name === "username" && value && !validateUsername(value)) {
      errors[field.name] =
        "Username must be 3–30 characters, start with a letter, and contain only letters, numbers, or underscores";
      return;
    }

    if (field.name === "role" && value && !validateRole(value)) {
      errors[field.name] = "Please choose a role";
      return;
    }

    if (field.type === "phone" && value && !validatePhone(value)) {
      errors[field.name] = "Please enter a valid phone number";
      return;
    }

    if (field.type === "password" && field.name !== "confirmPassword" && value && !validatePassword(value)) {
      errors[field.name] =
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@ $ ! % * ? & . # _ -)";
      return;
    }

    if (field.type === "otp" && value && !validateOtp(value)) {
      errors[field.name] = "OTP must be 6 digits";
      return;
    }

    if (
      field.name === "confirmPassword" &&
      value &&
      formData[field.matchField] &&
      value !== formData[field.matchField]
    ) {
      errors[field.name] = "Passwords do not match";
    }
  });

  return errors;
};