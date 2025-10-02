import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { API_BASE, api } from "../lib/api";
import { Alert, AlertIcon, Badge, Code, Card, CardHeader, CardBody, Heading, Flex, Spacer, Button, HStack, Text, Skeleton, SkeletonText, Box, Container, Link, Stack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { isHealthResponse } from "../lib/health";
import { useAuth } from "../state/auth/useAuth";
import UserSummary from "../components/UserSummary";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "checking">("idle");
  const [message, setMessage] = useState<string>("");
  const [lastChecked, setLastChecked] = useState<number | undefined>();
  const { user, bootstrapped } = useAuth();

  const MIN_CHECKING_MS = 450; // debounce skeleton flash
  const intervalMs = (() => {
    const raw = import.meta.env.VITE_HEALTH_REFRESH_MS;
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 1000 ? n : 30000;
  })();
  const checkStartRef = useRef<number | null>(null);

  const runHealthCheck = async () => {
    // For subsequent runs (not the very first idle state) show a transient checking skeleton
    setStatus(prev => prev === 'idle' ? prev : 'checking');
    checkStartRef.current = Date.now();
    try {
      const data = await api<unknown>("/actuator/health");
      setStatus("ok");
      if (isHealthResponse(data) && typeof data.status === "string" && data.status.length > 0) {
        setMessage(`status: ${data.status}`);
      } else {
        setMessage("Backend responded ✔");
      }
    } catch (e) {
      const err = e instanceof Error ? e : undefined;
      setStatus("error");
      setMessage(err?.message ?? "Failed to reach backend");
    } finally {
      const end = Date.now();
      const elapsed = checkStartRef.current ? end - checkStartRef.current : 0;
      const delay = status === 'checking' && elapsed < MIN_CHECKING_MS ? MIN_CHECKING_MS - elapsed : 0;
      setTimeout(() => setLastChecked(Date.now()), delay);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await runHealthCheck(); })();
    const id = setInterval(() => { if (!cancelled) runHealthCheck(); }, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return (
    <Container maxW='2xl' py={8}>
      <Stack spacing={8}>
        <Box as='header'>
          <Heading size='xl' mb={2}>🛥️ Welcome to SameBoat 👋</Heading>
          <Text fontSize='sm' opacity={0.8} mb={4}>
            Frontend is running. Backend base URL:&nbsp;
            <Code fontSize='xs'>{API_BASE}</Code>
          </Text>
          <HStack spacing={4} wrap='wrap' fontSize='sm' align='center'>
            {!user && (
              <>
                {!bootstrapped && (
                  <Text opacity={0.6}>Loading session…</Text>
                )}
                {bootstrapped && (
                  <>
                    <Text opacity={0.6}>Not signed in.</Text>
                    <Flex justifyContent={'center'}>
                      <Link as={RouterLink} to='/login' textDecoration='underline'>Login</Link>
                      <Link as={RouterLink} to='/register' textDecoration='underline'>Register</Link>
                    </Flex>
                  </>
                )}
              </>
            )}
            {user && (
              <Flex flexDirection={'column'} m={"auto"} my={6} alignItems={'center'} gap={5}>
                <Text opacity={0.85}>Signed in as <strong>{user.email}</strong></Text>
                <Button size='sm' as={RouterLink} to='/me' variant='outline' colorScheme='blue'>My Account</Button>
              </Flex>
            )}
          </HStack>
        </Box>

      <Card>
        <CardHeader py={3}>
          <Flex align="center" gap={3}>
            <Heading as='h2' size='sm'>Backend Health</Heading>
            <Spacer />
            {status === 'idle' && <Badge colorScheme='gray'>Checking</Badge>}
            {status === 'ok' && <Badge colorScheme='green'>OK</Badge>}
            {status === 'error' && <Badge colorScheme='red'>Error</Badge>}
          </Flex>
        </CardHeader>
        <CardBody pt={0} className="space-y-2">
          <AnimatePresence mode='wait'>
            <motion.div
              key={status + message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {status === "idle" && <Alert status='info' variant='subtle' size='sm'><AlertIcon />Checking…</Alert>}
              {status === "checking" && (
                <HStack spacing={4} align='flex-start'>
                  <Skeleton height='20px' width='72px' rounded='md' />
                  <SkeletonText noOfLines={1} skeletonHeight='4' width='140px' />
                </HStack>
              )}
              {status === "ok" && (
                <HStack spacing={3} fontSize='sm' align='flex-start'>
                  <Badge colorScheme='green'>Healthy</Badge>
                  <Code fontSize='xs'>{message}</Code>
                </HStack>
              )}
              {status === "error" && (
                  <Alert status='error' variant='subtle'>
                    <AlertIcon /> <span>Error — <Code fontSize='xs'>{message}</Code></span>
                  </Alert>
              )}
            </motion.div>
          </AnimatePresence>
          <HStack justify='space-between' pt={1} fontSize='xs' opacity={0.7} flexWrap='wrap'>
            <Text>
              {lastChecked ? `Last check: ${new Date(lastChecked).toLocaleTimeString()}` : 'Awaiting first result…'}
            </Text>
            <Button size='xs' variant='outline' onClick={runHealthCheck} isDisabled={status==='idle'}>
              Refresh now
            </Button>
          </HStack>
          <Text mt={4} fontSize='xs' opacity={0.7}>
            If this fails in dev, ensure the backend is running and CORS allows <Code fontSize='2xs'>http://localhost:5173</Code>. If you use Actuator defaults, switch the fetch path to <Code fontSize='2xs'>/actuator/health</Code>.
          </Text>
        </CardBody>
      </Card>

      {user && <UserSummary />}
      </Stack>
    </Container>
  );
}