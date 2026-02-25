import { motion } from 'framer-motion';

const Logo = ({ className = "w-10 h-10", animated = true }) => {
    return (
        <motion.div
            className={`flex items-center justify-center ${className}`}
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
        >
            <div style={{ textAlign: 'justify' }}>
                <p>
                    <img
                        src="/images/white_logo.png"
                        alt="white_logo.png"
                        style={{ height: 'auto', maxWidth: '100%', display: 'block' }}
                        onError={(e) => {
                            e.target.src = "/logo.svg";
                        }}
                    />
                </p>
            </div>
        </motion.div>
    );
};

export default Logo;
