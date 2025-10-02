import { useAuth } from '../state/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Text, Link, Flex, HStack, Code } from '@chakra-ui/react';

export default function Footer() {
  const { user, logout, status } = useAuth();
  const navigate = useNavigate();
  const busy = status === 'loading';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const version = import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_COMMIT_HASH || 'dev';
  const shortVersion = typeof version === 'string' && version.length > 10 ? version.slice(0, 7) : version;
  const feedbackUrl = import.meta.env.VITE_FEEDBACK_URL || 'https://github.com/sameboat-platform/frontend/issues/new';

  return (
    <Box as='footer' mt='auto' flexShrink={0} borderTopWidth='1px' borderColor='gray.200' _dark={{ borderColor: 'gray.700' }} marginTop={10} py={4} px={4} fontSize='xs'>
      <Flex direction={{ base: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ base: 'flex-start', md: 'center' }} gap={3} opacity={0.85}>
        <Flex direction='column' gap={1}>
          <Text>
            Built by <strong><Link href='mailto:nick@nickhanson.me' textDecoration='underline'>Nick Hanson</Link></strong> · <Link href='https://nickhanson.me' textDecoration='underline' isExternal>Showcase</Link>
          </Text>
          <HStack spacing={3} wrap='wrap'>
            <Text>Build: <Code fontSize='2xs'>{shortVersion}</Code></Text>
            <Link href={feedbackUrl} isExternal textDecoration='underline'>Feedback</Link>
          </HStack>
        </Flex>
        {user && (
          <Button size='xs' onClick={handleLogout} isDisabled={busy} colorScheme='blue' variant='solid'>
            {busy ? 'Signing out…' : 'Logout'}
          </Button>
        )}
      </Flex>
    </Box>
  );
}
