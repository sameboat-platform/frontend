import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { isHealthResponse } from '../lib/health';
import { Card, CardHeader, CardBody, Heading, Flex, Spacer, Badge, HStack, Skeleton, SkeletonText, Code, Alert, AlertIcon, Text, Button } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

interface HealthCheckCardProps {
  path?: string;               // health endpoint, default '/actuator/health'
  intervalMs?: number;         // auto refresh interval
  minSkeletonMs?: number;      // minimum time skeleton remains
  onStatusChange?: (status: string) => void; // optional callback
}

type HealthState = 'idle' | 'checking' | 'ok' | 'error';

export function HealthCheckCard({
  path = '/actuator/health',
  intervalMs,
  minSkeletonMs = 450,
  onStatusChange,
}: HealthCheckCardProps) {
  const envInterval = (() => {
    if (intervalMs) return intervalMs;
    const raw = import.meta.env.VITE_HEALTH_REFRESH_MS;
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 1000 ? n : 30000;
  })();
  const [status, setStatus] = useState<HealthState>('idle');
  const [message, setMessage] = useState('');
  const [lastChecked, setLastChecked] = useState<number | undefined>();
  const checkStartRef = useRef<number | null>(null);

  const runHealthCheck = useCallback(async () => {
    setStatus(prev => (prev === 'idle' ? prev : 'checking'));
    checkStartRef.current = Date.now();
    try {
      const data = await api<unknown>(path);
      setStatus('ok');
      if (isHealthResponse(data) && typeof (data as any).status === 'string' && (data as any).status.length > 0) {
        setMessage(`status: ${(data as any).status}`);
      } else {
        setMessage('Backend responded ✔');
      }
    } catch (e) {
      const err = e instanceof Error ? e : undefined;
      setStatus('error');
      setMessage(err?.message ?? 'Failed to reach backend');
    } finally {
      const end = Date.now();
      const elapsed = checkStartRef.current ? end - checkStartRef.current : 0;
      const delay = status === 'checking' && elapsed < minSkeletonMs ? minSkeletonMs - elapsed : 0;
      setTimeout(() => setLastChecked(Date.now()), delay);
    }
  }, [path, minSkeletonMs, status]);

  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await runHealthCheck(); })();
    const id = setInterval(() => { if (!cancelled) runHealthCheck(); }, envInterval);
    return () => { cancelled = true; clearInterval(id); };
  }, [envInterval, runHealthCheck]);

  return (
    <Card>
      <CardHeader py={3}>
        <Flex align='center' gap={3}>
          <Heading as='h2' size='sm'>Backend Health</Heading>
          <Spacer />
          {status === 'idle' && <Badge colorScheme='gray'>Checking</Badge>}
          {status === 'ok' && <Badge colorScheme='green'>OK</Badge>}
          {status === 'error' && <Badge colorScheme='red'>Error</Badge>}
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={status + message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {status === 'idle' && <Alert status='info' variant='subtle' size='sm'><AlertIcon />Checking…</Alert>}
            {status === 'checking' && (
              <HStack spacing={4} align='flex-start'>
                <Skeleton height='20px' width='72px' rounded='md' />
                <SkeletonText noOfLines={1} skeletonHeight='4' width='140px' />
              </HStack>
            )}
            {status === 'ok' && (
              <HStack spacing={3} fontSize='sm' align='flex-start'>
                <Badge colorScheme='green'>Healthy</Badge>
                <Code fontSize='xs'>{message}</Code>
              </HStack>
            )}
            {status === 'error' && (
              <Alert status='error' variant='subtle'>
                <AlertIcon /> <span>Error — <Code fontSize='xs'>{message}</Code></span>
              </Alert>
            )}
          </motion.div>
        </AnimatePresence>
        <HStack justify='space-between' pt={3} fontSize='xs' opacity={0.75} flexWrap='wrap'>
          <Text>{lastChecked ? `Last check: ${new Date(lastChecked).toLocaleTimeString()}` : 'Awaiting first result…'}</Text>
          <Button size='xs' variant='outline' onClick={runHealthCheck} isDisabled={status==='idle'}>Refresh now</Button>
        </HStack>
        <Text mt={2} fontSize='xs' opacity={0.6}>
          If this fails in dev, ensure the backend is running and CORS allows <Code fontSize='xs'>http://localhost:5173</Code>. If you use Actuator defaults, switch the fetch path to <Code fontSize='xs'>/actuator/health</Code>.
        </Text>
      </CardBody>
    </Card>
  );
}

export default HealthCheckCard;