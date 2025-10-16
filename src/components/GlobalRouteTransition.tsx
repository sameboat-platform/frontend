import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box } from '@chakra-ui/react';

/**
 * Global route transition component that animates route changes.
 * @returns {JSX.Element} The rendered component.
 */
export function GlobalRouteTransition() {
  const location = useLocation();
  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Box as='section'>
          <Outlet />
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

export default GlobalRouteTransition;