import { memo } from "react";

const FormField = memo(
  ({
    id,
    label,
    as: Component = "input",
    className = "",
    children,
    ...props
  }) => {
    const controlClass = Component === "select" ? "form-select" : "form-control";
    const mergedClassName = [controlClass, className].filter(Boolean).join(" ");

    return (
      <div className="mb-3">
        {label && (
          <label className="form-label" htmlFor={id}>
            {label}
          </label>
        )}
        <Component id={id} className={mergedClassName} {...props}>
          {children}
        </Component>
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
