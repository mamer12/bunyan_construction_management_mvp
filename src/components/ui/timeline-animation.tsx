import { motion } from "framer-motion";

export function TimelineContent({
  children,
  as = "div",
  className,
  animationNum,
  timelineRef,
  customVariants,
  ...props
}: any) {
  const Component = (motion as any)[as] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={customVariants}
      custom={animationNum}
      {...props}
    >
      {children}
    </Component>
  );
}
