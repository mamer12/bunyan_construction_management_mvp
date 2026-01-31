import { motion, type Variants, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

// ============================================
// ANIMATION VARIANTS
// ============================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// Stagger container for children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function MotionCard({ children, className = "", delay = 0, onClick, style }: MotionCardProps) {
  return (
    <motion.div
      className={`bento-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 20px 25px -5px rgb(5 150 105 / 0.15), 0 8px 10px -6px rgb(5 150 105 / 0.15)",
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Gradient Hero Card with special animation
export function MotionGradientCard({ children, className = "", delay = 0, style }: MotionCardProps) {
  return (
    <motion.div
      className={`bento-card gradient-card ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgb(5 150 105 / 0.3)",
        transition: { duration: 0.3 }
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatNumber?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 2,
  className = "",
  prefix = "",
  suffix = "",
  formatNumber = true
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const displayValue = formatNumber ? count.toLocaleString() : count.toString();

  return (
    <span className={`counter-value ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// ============================================
// ANIMATED PROGRESS RING / DONUT CHART
// ============================================

interface AnimatedDonutProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  bgColor?: string;
  children?: ReactNode;
}

export function AnimatedDonut({
  percentage,
  size = 160,
  strokeWidth = 12,
  className = "",
  color = "#059669",
  bgColor = "#E2E8F0",
  children
}: AnimatedDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newOffset = circumference - (percentage / 100) * circumference;
      setOffset(newOffset);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <div className={`donut-chart ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div className="donut-center">
        {children}
      </div>
    </div>
  );
}

// ============================================
// ANIMATED BUTTON
// ============================================

interface MotionButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function MotionButton({
  children,
  className = "",
  onClick,
  disabled = false,
  type = "button",
  style
}: MotionButtonProps) {
  return (
    <motion.button
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.15 }}
      style={style}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// BELL SHAKE ANIMATION (for notifications)
// ============================================

export function ShakingBell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{
        rotate: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }}
      style={{ display: 'inline-flex' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CONTAINER
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className = "", delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

// ============================================
// PAGE TRANSITION WRAPPER
// ============================================

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED LIST ITEM
// ============================================

interface MotionListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
  onClick?: () => void;
}

export function MotionListItem({ children, className = "", index = 0, onClick }: MotionListItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        x: 4,
        backgroundColor: "rgba(5, 150, 105, 0.05)",
        transition: { duration: 0.15 }
      }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PULSE INDICATOR
// ============================================

export function PulseIndicator({ color = "#EF4444" }: { color?: string }) {
  return (
    <motion.span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence };
