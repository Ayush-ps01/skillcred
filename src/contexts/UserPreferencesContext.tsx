import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UserPreferences {
  budget: {
    min: number;
    max: number;
  };
  style: string[];
  categories: string[];
  size: string[];
  color: string[];
  brand: string[];
  occasion: string[];
}

interface UserPreferencesState {
  preferences: UserPreferences;
  isLoaded: boolean;
}

type UserPreferencesAction =
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_BUDGET'; payload: { min: number; max: number } }
  | { type: 'UPDATE_STYLE'; payload: string[] }
  | { type: 'UPDATE_CATEGORIES'; payload: string[] }
  | { type: 'UPDATE_SIZE'; payload: string[] }
  | { type: 'UPDATE_COLOR'; payload: string[] }
  | { type: 'UPDATE_BRAND'; payload: string[] }
  | { type: 'UPDATE_OCCASION'; payload: string[] }
  | { type: 'RESET_PREFERENCES' }
  | { type: 'SET_LOADED'; payload: boolean };

const defaultPreferences: UserPreferences = {
  budget: { min: 0, max: 1000 },
  style: ['casual', 'modern'],
  categories: ['clothing', 'accessories'],
  size: ['M'],
  color: ['black', 'white', 'blue'],
  brand: [],
  occasion: ['everyday'],
};

const initialState: UserPreferencesState = {
  preferences: defaultPreferences,
  isLoaded: false,
};

const userPreferencesReducer = (
  state: UserPreferencesState,
  action: UserPreferencesAction
): UserPreferencesState => {
  switch (action.type) {
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
        isLoaded: true,
      };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          budget: action.payload,
        },
      };
    
    case 'UPDATE_STYLE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          style: action.payload,
        },
      };
    
    case 'UPDATE_CATEGORIES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          categories: action.payload,
        },
      };
    
    case 'UPDATE_SIZE':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          size: action.payload,
        },
      };
    
    case 'UPDATE_COLOR':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          color: action.payload,
        },
      };
    
    case 'UPDATE_BRAND':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          brand: action.payload,
        },
      };
    
    case 'UPDATE_OCCASION':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          occasion: action.payload,
        },
      };
    
    case 'RESET_PREFERENCES':
      return {
        ...state,
        preferences: defaultPreferences,
      };
    
    case 'SET_LOADED':
      return {
        ...state,
        isLoaded: action.payload,
      };
    
    default:
      return state;
  }
};

interface UserPreferencesContextType {
  state: UserPreferencesState;
  setPreferences: (preferences: UserPreferences) => void;
  updateBudget: (budget: { min: number; max: number }) => void;
  updateStyle: (style: string[]) => void;
  updateCategories: (categories: string[]) => void;
  updateSize: (size: string[]) => void;
  updateColor: (color: string[]) => void;
  updateBrand: (brand: string[]) => void;
  updateOccasion: (occasion: string[]) => void;
  resetPreferences: () => void;
  setLoaded: (loaded: boolean) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userPreferencesReducer, initialState);

  const setPreferences = (preferences: UserPreferences) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  };

  const updateBudget = (budget: { min: number; max: number }) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  };

  const updateStyle = (style: string[]) => {
    dispatch({ type: 'UPDATE_STYLE', payload: style });
  };

  const updateCategories = (categories: string[]) => {
    dispatch({ type: 'UPDATE_CATEGORIES', payload: categories });
  };

  const updateSize = (size: string[]) => {
    dispatch({ type: 'UPDATE_SIZE', payload: size });
  };

  const updateColor = (color: string[]) => {
    dispatch({ type: 'UPDATE_COLOR', payload: color });
  };

  const updateBrand = (brand: string[]) => {
    dispatch({ type: 'UPDATE_BRAND', payload: brand });
  };

  const updateOccasion = (occasion: string[]) => {
    dispatch({ type: 'UPDATE_OCCASION', payload: occasion });
  };

  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' });
  };

  const setLoaded = (loaded: boolean) => {
    dispatch({ type: 'SET_LOADED', payload: loaded });
  };

  const value: UserPreferencesContextType = {
    state,
    setPreferences,
    updateBudget,
    updateStyle,
    updateCategories,
    updateSize,
    updateColor,
    updateBrand,
    updateOccasion,
    resetPreferences,
    setLoaded,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
