import { useAuth } from '../state/auth/useAuth';
import { Card, CardHeader, CardBody, Heading, Text, Stack, Badge, Code, Button, Grid, GridItem, Avatar, Divider, Box, HStack, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function Me() {
  const { user, logout, status } = useAuth();
  const navigate = useNavigate();
  const accent = useColorModeValue('gray.50', 'whiteAlpha.50');
  const busy = status === 'loading';
  if (!user) return null; // ProtectedRoute handles redirect; guard for safety.
  return (
    <Box maxW='xl' mx='auto' px={6} py={8}>
      <Card variant='outline' overflow='hidden'>
        <CardHeader pb={3}>
          <HStack justify='space-between'>
            <Heading size='md'>My Account</Heading>
            <Button onClick={async () => { await logout(); navigate('/'); }} size='sm' colorScheme='blue' isDisabled={busy} variant='solid'>Logout</Button>
          </HStack>
        </CardHeader>
        <Divider />
        <CardBody pt={6}>
          <Grid templateColumns={{ base: '1fr', md: '160px 1fr' }} gap={8} alignItems='start'>
            <GridItem>
              <Stack align='center' spacing={4}>
                <Avatar name={user.displayName || user.email} size='xl' />
                <Badge colorScheme='green' variant='subtle'>Active</Badge>
              </Stack>
            </GridItem>
            <GridItem>
              <Stack spacing={5} fontSize='sm'>
                <Box bg={accent} p={4} rounded='md'>
                  <Heading size='xs' mb={2} letterSpacing='wide' textTransform='uppercase' opacity={0.7}>Profile</Heading>
                  <Stack spacing={1.5}>
                    <Text><Badge mr={2}>Email</Badge>{user.email}</Text>
                    {user.displayName && <Text><Badge mr={2}>Display</Badge>{user.displayName}</Text>}
                  </Stack>
                </Box>
                <Box bg={accent} p={4} rounded='md'>
                  <Heading size='xs' mb={2} letterSpacing='wide' textTransform='uppercase' opacity={0.7}>Identifiers</Heading>
                  <Stack spacing={1.5}>
                    <Text><Badge mr={2}>User ID</Badge><Code fontSize='xs'>{user.id}</Code></Text>
                  </Stack>
                </Box>
                {user.roles && user.roles.length > 0 && (
                  <Box bg={accent} p={4} rounded='md'>
                    <Heading size='xs' mb={2} letterSpacing='wide' textTransform='uppercase' opacity={0.7}>Roles</Heading>
                    <Stack direction='row' flexWrap='wrap' gap={2}>
                      {user.roles.map(r => <Badge key={r} colorScheme='purple'>{r}</Badge>)}
                    </Stack>
                  </Box>
                )}
                <Box fontSize='xs' opacity={0.6} pt={2}>Session status: {busy ? 'Updating…' : 'Stable'}</Box>
              </Stack>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
}
