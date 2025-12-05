import { memo, useState } from "react";

const PasswordField = memo(
  ({
    id = "password",
    name = "password",
    label = "Contraseña",
    value,
    onChange,
    required = false,
    placeholder = "",
    buttonVariant = "outline-secondary",
  }) => {
    const [show, setShow] = useState(false);

    return (
      <div className="mb-3">
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
        <div className="input-group">
          <input
            id={id}
            name={name}
            type={show ? "text" : "password"}
            className="form-control"
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            autoComplete="current-password"
          />
          <button
            type="button"
            className={`btn btn-${buttonVariant}`}
            onClick={() => setShow((prev) => !prev)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";

export default PasswordField;
