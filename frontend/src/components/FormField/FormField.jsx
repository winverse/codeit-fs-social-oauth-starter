import * as styles from './FormField.css';

export function FormField({
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
      {label ? <label className={styles.label}>{label}</label> : null}
      {isTextArea ? (
        <textarea
          className={styles.textarea}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      ) : (
        <input
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
