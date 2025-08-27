// Validation utility functions for form data

export const validationRules = {
  // Required field validation
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value) => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Username validation
  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 5) return 'Username must be at least 5 characters';
    if (value.length > 10) return 'Username must be less than 10 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (value.length > 15) return 'Password must be 15 characters or less';

    // Check for uppercase letter
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }

    // Check for number
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\'"\\|,.<>/?)';
    }

    return null;
  },

  // Name validation
  name: (value, fieldName = 'Name') => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (value.trim().length > 50) return `${fieldName} must be less than 50 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return null;
  },

  // Password confirmation validation
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }
};

// Password strength checker - returns array of requirements and their status
export const getPasswordStrength = (password) => {
  const requirements = [
    {
      test: password && password.length >= 8 && password.length <= 15,
      message: '8-15 characters',
      met: password && password.length >= 8 && password.length <= 15
    },
    {
      test: /[A-Z]/.test(password),
      message: 'One uppercase letter (A-Z)',
      met: /[A-Z]/.test(password)
    },
    {
      test: /[a-z]/.test(password),
      message: 'One lowercase letter (a-z)',
      met: /[a-z]/.test(password)
    },
    {
      test: /[0-9]/.test(password),
      message: 'One number (0-9)',
      met: /[0-9]/.test(password)
    },
    {
      test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      message: 'One special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    }
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strength = metCount === 0 ? 'weak' :
    metCount <= 2 ? 'weak' :
      metCount <= 3 ? 'medium' :
        metCount <= 4 ? 'good' : 'strong';

  return {
    requirements,
    strength,
    score: metCount,
    isValid: metCount === 5
  };
};

// Validation schemas for different forms
export const validationSchemas = {
  login: {
    username: [
      (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Username or Email is required';
        }
        return null;
      }
    ],
    password: [
      (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Password is required';
        }
        return null;
      }
    ]
  },

  signup: {
    firstName: [(value) => validationRules.name(value, 'First name')],
    lastName: [(value) => validationRules.name(value, 'Last name')],
    username: [validationRules.username],
    email: [
      (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Email is required';
        }
        return null;
      },
      validationRules.email
    ],
    password: [validationRules.password],
    confirmPassword: [
      (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Confirm password is required';
        }
        return null;
      },
      (value, allData) => validationRules.confirmPassword(allData.password, value)
    ]
  },

  profile: {
    firstName: [(value) => validationRules.name(value, 'First name')],
    lastName: [(value) => validationRules.name(value, 'Last name')],
    email: [
      (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Email is required';
        }
        return null;
      },
      validationRules.email
    ]
    // student field doesn't need validation as it's a boolean checkbox
  }
};

// Main validation function
export const validateFormData = (data, schema) => {
  console.log("validateFormData called with data:", data);
  console.log("validateFormData called with schema:", schema);

  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    console.log(`Validating field: ${field}, value:`, data[field]);

    for (const rule of rules) {
      let error;

      // Check if this is the confirmPassword validation that needs access to all data
      // by checking if the rule is the second rule in confirmPassword array
      const isConfirmPasswordRule = field === 'confirmPassword' && rules.indexOf(rule) === 1;

      console.log(`Field ${field}, rule index ${rules.indexOf(rule)}, isConfirmPasswordRule: ${isConfirmPasswordRule}`);

      if (isConfirmPasswordRule) {
        console.log(`Calling confirmPassword rule with value: "${data[field]}" and allData:`, data);
        error = rule(data[field], data);
      } else {
        console.log(`Calling regular rule with value: "${data[field]}"`);
        error = rule(data[field]);
      }

      console.log(`Field ${field}, rule result:`, error);

      if (error) {
        errors[field] = error;
        console.log(`Error added for field ${field}:`, error);
        break; // Stop at first error for this field
      }
    }
  }

  console.log("Final validation errors:", errors);
  return errors;
};

// Helper function to validate a single field
export const validateField = (fieldName, value, schema, allData = {}) => {
  const rules = schema[fieldName];
  if (!rules) return null;

  for (const rule of rules) {
    let error;

    // Check if this is the confirmPassword validation that needs access to all data
    const isConfirmPasswordRule = fieldName === 'confirmPassword' && rules.indexOf(rule) === 1;

    if (isConfirmPasswordRule) {
      error = rule(value, { ...allData, [fieldName]: value });
    } else {
      error = rule(value);
    }

    if (error) {
      return error;
    }
  }

  return null;
};

// Sanitization functions
export const sanitizeFormData = {
  // Trim whitespace from string fields
  trimStrings: (data) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  // Remove extra spaces and normalize names
  normalizeNames: (data) => {
    const normalized = { ...data };

    if (normalized.firstName) {
      normalized.firstName = normalized.firstName.trim().replace(/\s+/g, ' ');
    }
    if (normalized.lastName) {
      normalized.lastName = normalized.lastName.trim().replace(/\s+/g, ' ');
    }

    return normalized;
  },

  // Convert email to lowercase
  normalizeEmail: (data) => {
    const normalized = { ...data };
    if (normalized.email) {
      normalized.email = normalized.email.toLowerCase().trim();
    }
    return normalized;
  }
};

// Combined sanitization function
export const sanitizeData = (data) => {
  console.log("sanitizeData called with:", data);
  let sanitized = sanitizeFormData.trimStrings(data);
  console.log("After trimStrings:", sanitized);
  sanitized = sanitizeFormData.normalizeNames(sanitized);
  console.log("After normalizeNames:", sanitized);
  sanitized = sanitizeFormData.normalizeEmail(sanitized);
  console.log("After normalizeEmail:", sanitized);
  return sanitized;
};
