import { createContext, useContext } from 'react';

export const FieldContext = createContext({ vertical: false });
export const useField = () => useContext(FieldContext);
