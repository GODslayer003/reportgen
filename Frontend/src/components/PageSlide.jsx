// components/PageSlide.jsx
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function PageSlide({ children }) {
  const location = useLocation();
  const direction = location.state?.direction || "forward";

  const variants = {
    forward: {
      initial: { x: 40, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -40, opacity: 0 }
    },
    backward: {
      initial: { x: -40, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 40, opacity: 0 }
    }
  };

  return (
    <motion.div
      key={location.pathname}
      initial={variants[direction].initial}
      animate={variants[direction].animate}
      exit={variants[direction].exit}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}