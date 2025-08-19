import React from "react";
import { INPUT_CLASSES } from "../../constants/styles";

const FormInput = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const inputClasses = `${INPUT_CLASSES.base} ${
    error ? INPUT_CLASSES.error : INPUT_CLASSES.normal
  } ${className}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FormInput;
