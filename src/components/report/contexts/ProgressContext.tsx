import { createContext } from "react";

type ProgressContextType = {
    registerProgressItem: (itemId: string) => void;
    setProgressItemAsComplete: (itemId: string) => void;
};

// Provide initial values for the context
const initialContext: ProgressContextType = {
    registerProgressItem: () => { },
    setProgressItemAsComplete: () => { },
};

export const ProgressContext = createContext<ProgressContextType>(initialContext);