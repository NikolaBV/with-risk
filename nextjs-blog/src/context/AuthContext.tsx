"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User; session: Session }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          return;
        }

        console.log('Initial session exists:', !!initialSession);
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, !!currentSession);
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("User").insert({
        id: data.user.id,
        email: data.user.email,
        username,
      });
      if (profileError) throw profileError;
    }
    } finally {
    setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

      console.log('Sign in successful, session exists:', !!data.session);

      // Ensure session is set
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

    return { user: data.user, session: data.session };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setSession(null);
      router.push("/");
    } finally {
    setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
