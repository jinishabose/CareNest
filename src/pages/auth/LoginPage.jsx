import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Shield, Heart, Stethoscope } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const roles = [
  { id: 'guardian', label: 'Guardian', icon: Shield, description: 'Manage medications for family members' },
  { id: 'patient', label: 'Patient', icon: Heart, description: 'Track your own medications' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Monitor patient adherence' }
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'guardian'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (error) clearError()
  }

  const validate = () => {
    const errors = {}
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await login(formData.email, formData.password, formData.role)
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo & Header */}
        <div className="auth-header">
          <img src="/logo.svg" alt="CareNest" className="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Sign in to continue managing your wellness journey</p>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className={`input ${validationErrors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`input ${validationErrors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="error-text">{validationErrors.password}</span>
            )}
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label className="input-label">I am a</label>
            <div className="role-selector">
              {roles.map(role => (
                <motion.button
                  key={role.id}
                  type="button"
                  className={`role-option ${formData.role === role.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <role.icon size={20} />
                  <span className="role-label">{role.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg full-width"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <span className="loading-spinner" />
            ) : (
              'Sign In'
            )}
          </motion.button>

          {/* Divider */}
          <div className="divider">
            <span>or continue with</span>
          </div>

          {/* Google Sign-in */}
          <motion.button
            type="button"
            className="btn btn-google full-width"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={async () => {
              const result = await loginWithGoogle(formData.role)
              if (result.success) navigate('/')
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </motion.button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: linear-gradient(135deg, rgba(27, 94, 32, 0.03) 0%, rgba(255, 249, 196, 0.05) 100%);
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .auth-logo {
          width: 64px;
          height: 64px;
          margin-bottom: var(--space-4);
        }

        .auth-header h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-2);
          color: var(--forest-green);
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-4);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-wrapper .input {
          padding-left: var(--space-10);
          padding-right: var(--space-10);
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: var(--space-3);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--space-2);
          display: flex;
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        .error-text {
          font-size: var(--font-size-xs);
          color: var(--error);
          margin-top: var(--space-1);
        }

        .role-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
        }

        .role-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: var(--surface-muted);
          border: 2px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .role-option:hover {
          background: rgba(27, 94, 32, 0.05);
        }

        .role-option.active {
          background: rgba(27, 94, 32, 0.1);
          border-color: var(--forest-green);
          color: var(--forest-green);
        }

        .role-label {
          font-size: var(--font-size-xs);
          font-weight: 500;
        }

        .full-width {
          width: 100%;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: var(--font-size-sm);
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .divider span {
          padding: 0 var(--space-4);
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.15);
          color: var(--text-primary);
          font-weight: 500;
        }

        .btn-google:hover {
          background: var(--surface-muted);
          border-color: rgba(0, 0, 0, 0.2);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          margin-top: var(--space-6);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--forest-green);
          font-weight: 500;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
