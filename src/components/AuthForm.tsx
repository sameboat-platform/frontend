import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import type { PropsWithChildren, ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function AuthForm({ title, subtitle, footer, children }: PropsWithChildren<AuthFormProps>) {
  return (
    <Box maxW="sm" mx="auto" py={8} px={6}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading as='h1' size='lg' mb={1}>{title}</Heading>
          {subtitle && <Text fontSize='sm' opacity={0.8}>{subtitle}</Text>}
        </Box>
        <VStack as='section' align='stretch' spacing={4}>
          {children}
        </VStack>
        {footer && <Box fontSize='sm'>{footer}</Box>}
      </VStack>
    </Box>
  );
}
