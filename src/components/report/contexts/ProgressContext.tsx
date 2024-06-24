import { createContext } from "react";

type ProgressContextType = {
    registerProgressItem: (itemId: string) => void;
    setProgressItemAsComplete: (itemId: string) => void;
};

// Provide initial values for the context
const initialContext: ProgressContextType = {
    registerProgressItem: (itemId: string) => { },
    setProgressItemAsComplete: (itemId: string) => { },
};

export const ProgressContext = createContext<ProgressContextType>(initialContext);