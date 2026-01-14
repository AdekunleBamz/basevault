import { motion } from 'framer-motion';

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <motion.div
      className="text-center py-8 px-4 rounded-xl bg-base-dark/50 border border-base-border"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      {title && <h4 className="text-lg font-semibold mb-1">{title}</h4>}
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
