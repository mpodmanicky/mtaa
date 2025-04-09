import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from '@/theme';

const ThemeContext = createContext({
    theme: lightTheme,
    toggleTheme: () => {}
})

export const ThemeProvider = ({ children }: { children: React.ReactNode}) => {
    const [theme, setTheme] = useState(lightTheme);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
    };
    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            { children }
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);