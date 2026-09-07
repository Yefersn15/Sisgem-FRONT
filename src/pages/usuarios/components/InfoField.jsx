const InfoField = ({ icon, label, name, value, onChange, disabled, type = 'text', placeholder, required }) => (
  <div className="mb-3">
    <label className="form-label d-flex align-items-center gap-2">
      <i className={`fas ${icon}`} style={{ color: 'var(--text-muted)', width: 14 }}></i>
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="form-control"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default InfoField;
