import { AnimatePresence, motion } from 'framer-motion';
import type { ToastMessage } from '../types';

interface ToastStackProps {
  items: ToastMessage[];
}

export function ToastStack({ items }: ToastStackProps) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="toast"
          >
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
