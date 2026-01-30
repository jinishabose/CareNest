import { motion } from 'framer-motion'

export default function SplashScreen() {
    return (
        <div className="splash-screen">
            <motion.div
                className="splash-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Breathing Logo */}
                <motion.div
                    className="splash-logo"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <svg width="120" height="120" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#1B5E20' }} />
                                <stop offset="100%" style={{ stopColor: '#FFF9C4' }} />
                            </linearGradient>
                        </defs>
                        <circle cx="32" cy="32" r="28" fill="url(#splashGradient)" opacity="0.15" />
                        <path
                            d="M32 12C21 12 12 21 12 32C12 43 21 52 32 52C43 52 52 43 52 32"
                            stroke="url(#splashGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <path
                            d="M32 20V32L40 36"
                            stroke="#1B5E20"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="32" cy="32" r="4" fill="#1B5E20" />
                        <path d="M44 20L48 24M48 20L44 24" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="46" cy="22" r="8" fill="#FFF9C4" opacity="0.3" />
                    </svg>
                </motion.div>

                {/* Brand Name */}
                <motion.h1
                    className="splash-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    CareNest
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    className="splash-tagline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    Your digital wellness companion
                </motion.p>

                {/* Loading Indicator */}
                <motion.div
                    className="splash-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.3 }}
                >
                    <motion.div
                        className="splash-loader-dot"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0
                        }}
                    />
                    <motion.div
                        className="splash-loader-dot"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.2
                        }}
                    />
                    <motion.div
                        className="splash-loader-dot"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.4
                        }}
                    />
                </motion.div>
            </motion.div>

            <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #81C784 70%, #FFF9C4 100%);
          z-index: 9999;
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .splash-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 160px;
          height: 160px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .splash-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .splash-tagline {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 400;
        }

        .splash-loader {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .splash-loader-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
        }
      `}</style>
        </div>
    )
}
