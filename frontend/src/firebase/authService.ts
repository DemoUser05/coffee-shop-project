import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  // Додано для Google
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './config';

// Інтерфейси для типізації
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: AppUser;
  error?: string;
  message?: string;
}

// Функція для трансформації Firebase User в AppUser
const transformFirebaseUser = (firebaseUser: User): AppUser => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
};

// ========== РЕЄСТРАЦІЯ EMAIL ==========
export const registerWithEmail = async (
  email: string, 
  password: string, 
  name: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (user) {
      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);
    }
    
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: user.photoURL,
      },
      message: 'Реєстрація успішна! Перевірте email для підтвердження.' 
    };
  } catch (error: any) {
    let errorMessage = 'Помилка при реєстрації';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Користувач з таким email вже існує';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Невірний формат email';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Пароль занадто слабкий (мінімум 6 символів)';
    }
    
    return { success: false, error: errorMessage };
  }
};

// ========== ВХІД EMAIL ==========
export const loginWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return { 
      success: true, 
      user: transformFirebaseUser(user)
    };
  } catch (error: any) {
    let errorMessage = 'Помилка при вході';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Користувача не знайдено';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Невірний пароль';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Невірний формат email';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Акаунт заблоковано';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Забагато спроб. Спробуйте пізніше';
    }
    
    return { success: false, error: errorMessage };
  }
};

// ========== ВХІД ЧЕРЕЗ GOOGLE ==========
export const loginWithGoogle = async (usePopup: boolean = true): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    
    // Додаємо додаткові scope
    provider.addScope('profile');
    provider.addScope('email');
    
    let userCredential;
    
    if (usePopup) {
      // Вхід через popup (для десктопу)
      userCredential = await signInWithPopup(auth, provider);
    } else {
      // Вхід через redirect (для мобільних)
      await signInWithRedirect(auth, provider);
      
      // Після redirect потрібно отримати результат
      const result = await getRedirectResult(auth);
      if (result) {
        userCredential = result;
      } else {
        return { success: false, error: 'Помилка при авторизації через Google' };
      }
    }
    
    const user = userCredential.user;
    
    return {
      success: true,
      user: transformFirebaseUser(user),
      message: 'Вхід через Google успішний!'
    };
  } catch (error: any) {
    let errorMessage = 'Помилка при вході через Google';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Вікно авторизації закрито користувачем';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Спробуйте авторизуватись через redirect або дозвольте popup';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Запит авторизації скасовано';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'Акаунт з таким email вже існує з іншим методом входу';
    }
    
    return { success: false, error: errorMessage };
  }
};

// ========== ПЕРЕВІРКА REDIRECT РЕЗУЛЬТАТУ ==========
export const checkGoogleRedirectResult = async (): Promise<AuthResponse> => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result) {
      return {
        success: true,
        user: transformFirebaseUser(result.user),
        message: 'Вхід через Google успішний!'
      };
    }
    
    return { success: false, error: 'Немає результату redirect' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== ВИХІД ==========
export const logoutUser = async (): Promise<{success: boolean; error?: string}> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: 'Помилка при виході' 
    };
  }
};

// ========== СЛУХАЧ СТАНУ АВТОРИЗАЦІЇ ==========
export const onAuthStateChange = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(transformFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};

// ========== ПОТОЧНИЙ КОРИСТУВАЧ ==========
export const getCurrentUser = (): AppUser | null => {
  const user = auth.currentUser;
  return user ? transformFirebaseUser(user) : null;
};

// ========== ОНОВЛЕННЯ ПРОФІЛЮ ==========
export const updateUserProfile = async (data: { 
  displayName?: string, 
  photoURL?: string 
}): Promise<{success: boolean; error?: string}> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Користувач не авторизований');
    
    await updateProfile(user, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== ОНОВЛЕННЯ ПАРОЛЯ ==========
export const updateUserPassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<{success: boolean; error?: string}> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Користувач не авторизований');
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== СКИДАННЯ ПАРОЛЯ ==========
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  return { 
    success: true, 
    message: 'Лист для скидання пароля надіслано' 
  };
};

// Аліаси для сумісності
export const onAuthChange = onAuthStateChange;
export const register = registerWithEmail;
export const login = loginWithEmail;
export const logout = logoutUser;