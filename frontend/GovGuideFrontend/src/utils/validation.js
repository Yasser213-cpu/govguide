export const validateEmail = (email) => {
  if (!email || email.trim() === "") return false;

  if (!email.includes("@")) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRole = (role)=>{
  return (role == "client" || role == "company") ? true : false
}

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateOtp = (otp) => {
  return otp.length === 6 && /^\d+$/.test(otp);
};

export const getValidationErrors = (formData, fields) => {
  const errors = {};

  fields.forEach((field) => {
    const value = formData[field.name];

    if (field.required && (!value || value.trim() === "")) {
      errors[field.name] = "This field is required";
      return;
    }

    if (field.type === "email" && value) {
      if (!value.includes("@")) {
        errors[field.name] = "Email must contain @";
        return;
      }
      if (!validateEmail(value)) {
        errors[field.name] = "Please enter a valid email (e.g., user@example.com)";
        return;
      }
    }

    if(field.type=="text" && field.name=="role" && value && !validateRole(value)){
        errors[field.name] = "choose role"
        return;
    }

    if (field.type === "phone" && value && !validatePhone(value)) {
      errors[field.name] = "Please enter a valid phone number";
      return;
    }

    if (field.type === "password" && value && !validatePassword(value)) {
      errors[field.name] = "Password must be at least 8 characters";
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
