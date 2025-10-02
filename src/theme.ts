import { extendTheme } from "@chakra-ui/react";
import type { ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "system",
    useSystemColorMode: true,
};

const theme = extendTheme({
    config,
    colors: {
        brand: {
            50: "#e8f2ff",
            100: "#cfe4ff",
            200: "#9fccff",
            300: "#6fb3ff",
            400: "#3f9bff",
            500: "#0f83ff",
            600: "#0068d1",
            700: "#004ea0",
            800: "#00366f",
            900: "#001f40",
        },
    },
    components: {
        Button: { defaultProps: { colorScheme: "brand" } },
        Heading: { baseStyle: { fontWeight: 700 } },
    },
});

export default theme;
