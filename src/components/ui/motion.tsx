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
        y: -3,
        boxShadow: "0 12px 20px -10px rgba(0, 0, 0, 0.1)",
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

// ============================================
// BENTO GRID COMPONENTS
// ============================================

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
}

export function BentoGrid({ children, className = "", columns = 4 }: BentoGridProps) {
  return (
    <div
      className={cn(
        "bento-grid",
        columns === 4 && "lg:grid-cols-4",
        columns === 3 && "lg:grid-cols-3",
        columns === 2 && "lg:grid-cols-2",
        className
      )}
      style={{ padding: 0 }}
    >
      {children}
    </div>
  );
}

// ================= ===========================
// PROFESSIONAL PROJECT CARD
// ============================================

interface ProjectCardProps {
  project: Record<string, any>;
  onClick?: () => void;
  delay?: number;
}

export function ProjectCard({ project, onClick, delay = 0 }: ProjectCardProps) {
  const completionRate = project.totalTasksCount > 0
    ? Math.round((project.completedTasksCount / project.totalTasksCount) * 100)
    : project.completionRate || 0;

  const budgetUsage = project.totalBudget > 0
    ? Math.round((project.budgetSpent / project.totalBudget) * 100)
    : project.budgetUsage || 0;

  return (
    <MotionCard
      onClick={onClick}
      delay={delay}
      className="group overflow-hidden flex flex-col h-full"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

      <div className="p-5 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors duration-300">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                {project.name || project.projectName}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                <MapPin size={10} className="text-emerald-500" />
                {project.location || "Default Location"}
              </div>
            </div>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
            project.status === 'ACTIVE' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
          )}>
            {project.status || 'ACTIVE'}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-2 mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-lg font-bold text-slate-800">{completionRate}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-700">
                {budgetUsage}%
              </span>
              <span className="text-[9px] text-slate-400 font-bold">USED</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units</p>
            <span className="text-sm font-bold text-slate-700">
              {project.unitCount || project.totalUnits || 0}
            </span>
          </div>
        </div>
      </div>
    </MotionCard>
  );
}

// Re-export icon for ProjectCard
import { Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence };
