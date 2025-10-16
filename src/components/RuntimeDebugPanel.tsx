import { useEffect, useRef, useState } from 'react';
import { buildUrl } from '../lib/api';
import { isProd } from '../lib/env';
import { useAuth } from '../state/auth/useAuth';
import { Box, Code, Divider, Flex, HStack, Stack, Text, Badge, useColorModeValue, IconButton, Tooltip, Collapse, usePrefersReducedMotion, Link } from '@chakra-ui/react';
import { RepeatIcon, ViewOffIcon, CopyIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface NetProbe {
  path: string;
  status: number | 'ERR' | null;
  ok?: boolean;
  ts: number;
}

// Represents a single entry in the probe history.
type ProbeHistoryEntry = NetProbe;

// RuntimeDebugPanel: A floating panel showing runtime debug info (dev only).
// Shows auth state, API_BASE, user info, and probes key endpoints every 15s.
// Can be collapsed to a badge. Will NOT be shown in production builds.
// Important: This module hard-guards at the very top of the component to
// avoid running any hooks/effects in production. Also gated at the render
// site (App.tsx) using isDev() for extra safety and tree-shaking.
export default function RuntimeDebugPanel() {
  // Hard guard: never run any hooks/effects in production
  // This executes before any hooks are declared, so no side-effects in prod.
  if (isProd()) return null;
  const { user, status, errorCode, errorMessage, bootstrapped, lastFetched, refresh } = useAuth();
  const [renderTs, setRenderTs] = useState(Date.now());

  const version = import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_COMMIT_HASH || 'dev';
  const shortVersion = typeof version === 'string' && version.length > 10 ? version.slice(0, 7) : version;
  const feedbackUrl = import.meta.env.VITE_FEEDBACK_URL || 'https://github.com/sameboat-platform/frontend/issues/new';
  // Update timestamp only when meaningful auth-related values change to avoid infinite loop
  useEffect(() => {
    setRenderTs(Date.now());
  }, [user, status, errorCode, errorMessage, bootstrapped, lastFetched]);
  const [probes, setProbes] = useState<NetProbe[]>([]);
  const [probeHistory, setProbeHistory] = useState<ProbeHistoryEntry[]>([]); // rolling history
  const [errorCount, setErrorCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!bootstrapped) return; // wait until bootstrap completes to avoid early 401 noise
  const targets = ['/actuator/health', '/api/me'];
    let cancelled = false;
    const run = async () => {
      const results: NetProbe[] = [];
      for (const t of targets) {
        try {
          const res = await fetch(buildUrl(t), { credentials: 'include' });
          results.push({ path: t, status: res.status, ok: res.ok, ts: Date.now() });
        } catch {
          results.push({ path: t, status: 'ERR', ts: Date.now() });
        }
      }
      if (!cancelled && mounted.current) setProbes(results);
      if (!cancelled && mounted.current) {
        setProbeHistory(prev => {
          const merged = [...results.map(r => ({ ...r })), ...prev];
          return merged.slice(0, 25); // keep last 25 entries
        });
        const newErrors = results.filter(r => r.status !== 200).length;
        if (newErrors > 0) setErrorCount(c => c + newErrors);
      }
    };
    run();
    const id = setInterval(run, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [bootstrapped]);

  const bg = useColorModeValue('whiteAlpha.900', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const badgeScheme = (s: NetProbe['status']) => s === 200 ? 'green' : s === 401 ? 'yellow' : s === 'ERR' ? 'red' : 'purple';

  const copy = (value: string) => {
    if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(value).catch(() => {});
  };

  const collapsedBadge = (
    <Flex
      position='fixed'
      bottom={4}
      right={4}
      zIndex={1400}
      bg={bg}
      borderWidth='1px'
      borderColor={border}
      shadow='md'
      rounded='full'
      px={3}
      py={2}
      align='center'
      gap={2}
      fontFamily='mono'
      fontSize='xs'
      cursor='pointer'
      onClick={() => setCollapsed(false)}
    >
      <Text fontWeight='bold'>Debug</Text>
      {errorCount > 0 && <Badge colorScheme='red'>{errorCount}</Badge>}
      <ChevronUpIcon />
    </Flex>
  );

  if (collapsed) return collapsedBadge;

  const panel = (
    <Box position='fixed' bottom={4} right={4} zIndex={1400} fontFamily='mono' fontSize='xs'>
      <Stack
        spacing={3}
        maxW='sm'
        bg={bg}
        borderWidth='1px'
        borderColor={border}
        shadow='lg'
        rounded='md'
        p={4}
        backdropFilter='auto'
        backdropBlur='8px'
      >
        <Flex justify='space-between' align='center'>
          <HStack spacing={2}>
            <Text fontWeight='bold'>Runtime Debug</Text>
            {errorCount > 0 && <Badge colorScheme='red'>{errorCount}</Badge>}
          </HStack>
          <HStack spacing={1}>
            <Tooltip label='Copy API_BASE'>
              <IconButton aria-label='copy api base' icon={<CopyIcon />} size='xs' variant='ghost' onClick={() => copy(buildUrl('/'))} />
            </Tooltip>
            {user && (
              <Tooltip label='Copy user id'>
                <IconButton aria-label='copy user id' icon={<CopyIcon />} size='xs' variant='ghost' onClick={() => copy(user.id)} />
              </Tooltip>
            )}
            <Tooltip label='Refresh auth & /me'>
              <IconButton aria-label='refresh auth' icon={<RepeatIcon />} size='xs' variant='ghost' onClick={() => refresh()} />
            </Tooltip>
            {!bootstrapped && (
              <Tooltip label='Force refresh (StrictMode remount)'>
                <IconButton aria-label='force refresh' icon={<ViewOffIcon />} size='xs' variant='ghost' onClick={() => {
                  const w = window as unknown as { __AUTH__?: { refresh?: () => void } };
                  w.__AUTH__?.refresh?.();
                }} />
              </Tooltip>
            )}
            <Tooltip label='Collapse panel'>
              <IconButton aria-label='collapse' icon={<ChevronDownIcon />} size='xs' variant='ghost' onClick={() => setCollapsed(true)} />
            </Tooltip>
          </HStack>
        </Flex>
        <Flex justifyContent='space-between' wrap='wrap'>
          <Text>Build: <Badge fontSize='2xs' colorScheme='blue'>{shortVersion}</Badge></Text>
          <Link href={feedbackUrl} isExternal textDecoration='underline'>Feedback</Link>
        </Flex>
        <Collapse in={!collapsed} animateOpacity={!prefersReducedMotion} style={{ overflow: 'visible' }}>
          <Stack spacing={1} lineHeight={1.3} mb={2}>
            <Text><Text as='span' opacity={0.6}>API_BASE:</Text> <Code fontSize='2xs'>{buildUrl('/')}</Code></Text>
            <Text><Text as='span' opacity={0.6}>bootstrapped:</Text> {String(bootstrapped)}</Text>
            <Text><Text as='span' opacity={0.6}>render:</Text> {new Date(renderTs).toLocaleTimeString()}</Text>
            <Text><Text as='span' opacity={0.6}>status:</Text> {status}</Text>
            <Text><Text as='span' opacity={0.6}>user:</Text> {user ? user.email : 'null'}</Text>
            {lastFetched && <Text><Text as='span' opacity={0.6}>lastFetched:</Text> {new Date(lastFetched).toLocaleTimeString()}</Text>}
            {errorCode && <Text color='red.400'>error: {errorCode}{errorMessage && ` (${errorMessage})`}</Text>}
          </Stack>
          <Divider />
          <Box>
            <Text fontWeight='semibold' mb={1}>Probes (latest)</Text>
            <Stack spacing={1} mb={2}>
              {probes.map(p => (
                <Flex key={p.path} justify='space-between' align='center'>
                  <Code fontSize='2xs'>{p.path}</Code>
                  <Badge colorScheme={badgeScheme(p.status)}>{p.status}</Badge>
                </Flex>
              ))}
            </Stack>
            <Text fontWeight='semibold' mb={1}>Recent History</Text>
            <Stack maxH='120px' overflowY='auto' spacing={0.5} pr={1}>
              {probeHistory.map((h, idx) => (
                <Flex key={h.ts + '-' + idx} justify='space-between' fontSize='2xs'>
                  <Text>{new Date(h.ts).toLocaleTimeString()} · {h.path}</Text>
                  <Badge colorScheme={badgeScheme(h.status)}>{h.status}</Badge>
                </Flex>
              ))}
            </Stack>
          </Box>
          <Text fontSize='2xs' opacity={0.55} mt={2}>Panel auto-refreshes every 15s. Dev only.</Text>
        </Collapse>
      </Stack>
    </Box>
  );
  return panel;
}
