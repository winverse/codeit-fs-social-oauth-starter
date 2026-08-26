import * as styles from './FormField.css';

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  isTextArea,
  errorMessage,
  onBlur,
  onKeyDown,
  autoComplete,
  type = 'text',
}) {
  return (
    <div>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      {isTextArea ? (
        <textarea
          id={id}
          className={styles.textarea}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          type={type}
        />
      )}
      {errorMessage ? (
        <span className={styles.error}>{errorMessage}</span>
      ) : null}
    </div>
  );
}
