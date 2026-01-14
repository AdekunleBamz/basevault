import { motion } from 'framer-motion';

export function ConfigBanner({ title, description, action }) {
  return (
    <motion.div
      className="mb-6 rounded-xl border border-base-warning/40 bg-base-warning/10 px-4 py-3 text-sm text-yellow-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">⚠️</span>
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-yellow-200/80">{description}</div>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </motion.div>
  );
}
