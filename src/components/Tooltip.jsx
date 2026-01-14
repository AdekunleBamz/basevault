import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from '../hooks/useUtils';

/**
 * Tooltip component with hover/click support
 */
export function Tooltip({ 
  children, 
  content, 
  position = 'top', 
  trigger = 'hover',
  delay = 200,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  useOnClickOutside(tooltipRef, () => {
    if (trigger === 'click') setIsVisible(false);
  });

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rotate-45',
  };

  const handleMouseEnter = () => {
    if (trigger !== 'hover') return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return;
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger !== 'click') return;
    setIsVisible(!isVisible);
  };

  return (
    <div 
      ref={tooltipRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            className={`absolute z-50 ${positionStyles[position]}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative px-3 py-2 text-sm bg-base-card border border-base-border rounded-lg shadow-xl whitespace-nowrap">
              {content}
              <div 
                className={`absolute w-2 h-2 bg-base-card border-base-border ${arrowStyles[position]}`}
                style={{ 
                  borderWidth: position === 'top' || position === 'left' ? '0 1px 1px 0' : '1px 0 0 1px' 
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Info icon with tooltip
 */
export function InfoTooltip({ content, size = 'sm' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  return (
    <Tooltip content={content} position="top">
      <span 
        className={`inline-flex items-center justify-center rounded-full bg-base-border text-gray-400 cursor-help ${sizeClasses[size]}`}
        aria-label="More information"
      >
        ?
      </span>
    </Tooltip>
  );
}

/**
 * Help text with expandable details
 */
export function HelpText({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        aria-expanded={isExpanded}
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>{title}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-4 text-gray-500">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
