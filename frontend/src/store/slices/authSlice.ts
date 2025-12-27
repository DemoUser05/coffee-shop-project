// frontend/src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const loadAuthState = (): AuthState => {
  try {
    const saved = localStorage.getItem('authState');
    if (!saved) return initialState;
    
    const parsed = JSON.parse(saved);
    return {
      ...initialState,
      user: parsed.user,
      isAuthenticated: !!parsed.user,
      loading: false,
      error: null,
    };
  } catch (error) {
    console.warn('Помилка завантаження auth:', error);
    return initialState;
  }
};

const saveAuthState = (state: AuthState) => {
  try {
    const data = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      error: state.error,
    };
    localStorage.setItem('authState', JSON.stringify(data));
  } catch (error) {
    console.warn('Помилка збереження auth:', error);
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthState(),
  reducers: {
    setUser: (state, action: PayloadAction<AppUser | null>) => {
      const newUser = action.payload;
      state.user = newUser;
      state.isAuthenticated = !!newUser;
      state.loading = false;
      state.error = null;
      
      saveAuthState(state);
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      localStorage.removeItem('authState');
    },
    
    updateProfile: (state, action: PayloadAction<Partial<AppUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveAuthState(state);
      }
    },
  },
});

export const { 
  setUser, 
  setLoading, 
  setError, 
  clearError, 
  logout, 
  updateProfile 
} = authSlice.actions;

export default authSlice.reducer;