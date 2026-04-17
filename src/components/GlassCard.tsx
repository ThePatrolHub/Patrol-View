import { motion } from 'framer-motion';
import type { PropsWithChildren, ReactNode } from 'react';

interface GlassCardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function GlassCard({ title, subtitle, action, className = '', children }: GlassCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`glass-card ${className}`.trim()}
    >
      {(title || subtitle || action) && (
        <div className="glass-card__header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action ? <div className="glass-card__action">{action}</div> : null}
        </div>
      )}
      {children}
    </motion.section>
  );
}
