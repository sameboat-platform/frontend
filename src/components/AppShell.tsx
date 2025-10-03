import { Box, Container, Flex, HStack, IconButton, Link as CLink, Spacer, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export default function AppShell({ children }: PropsWithChildren) {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex direction="column" minH="100dvh">
      <CLink href="#main" position="absolute" left="-9999px" _focus={{ left: 2, top: 2, p: 2, bg: 'yellow.300' }}>Skip to content</CLink>
      <Box as="header" borderBottomWidth="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
        <Container maxW="container.lg" py={3}>
          <Flex align="center">
            <HStack spacing={4} fontWeight="bold">
              <Link to="/">SameBoat</Link>
            </HStack>
            <Spacer />
            <IconButton
              aria-label="Toggle color mode"
              onClick={toggleColorMode}
              size="sm"
              variant="ghost"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            />
          </Flex>
        </Container>
      </Box>
      <Container id="main" as="main" maxW="container.sm" py={10} flex="1 0 auto">
        {children}
      </Container>
    </Flex>
  );
}
