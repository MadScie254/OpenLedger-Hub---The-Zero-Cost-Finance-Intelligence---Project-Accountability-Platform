"use client";

/**
 * GoogleSignIn Component
 * 
 * Implements Google Identity Services (GIS) for OAuth 2.0 authentication.
 * Uses official google.accounts.id API (not deprecated gapi).
 * 
 * Flow:
 * 1. Load Google Identity Services script
 * 2. Initialize with client_id
 * 3. Render sign-in button
 * 4. On success, send id_token to backend
 * 5. Backend verifies token and sets session cookie
 * 6. Redirect to dashboard
 */

import { useEffect, useState } from "react";

// Extend Window interface for Google Identity Services
declare global {
    interface Window {
        google: any;
    }
}

interface GoogleSignInProps {
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
    buttonTheme?: 'outline' | 'filled_blue' | 'filled_black';
    buttonSize?: 'large' | 'medium' | 'small';
    buttonText?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function GoogleSignIn({
    onSuccess,
    onError,
    buttonTheme = 'outline',
    buttonSize = 'large',
    buttonText = 'signin_with'
}: GoogleSignInProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const scriptId = "google-identity-script";

        // Check if script already loaded
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            script.onerror = () => {
                const err = "Failed to load Google Identity Services";
                setError(err);
                onError?.(err);
            };
            document.head.appendChild(script);
        } else {
            // Script already exists, initialize
            initializeGoogleSignIn();
        }

        function initializeGoogleSignIn() {
            if (!window.google) {
                console.error("Google Identity Services not loaded");
                return;
            }

            try {
                // Initialize Google Identity Services
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "201157854759-kda437apl4amk0vq9c4kkgffq00mqmqo.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                    ux_mode: 'popup',
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                // Render the sign-in button
                const buttonContainer = document.getElementById("google-signin-button");
                if (buttonContainer) {
                    window.google.accounts.id.renderButton(
                        buttonContainer,
                        {
                            theme: buttonTheme,
                            size: buttonSize,
                            text: buttonText,
                            width: 280,
                            logo_alignment: 'left',
                        }
                    );
                }

                // Also enable One Tap if user wants (optional)
                // window.google.accounts.id.prompt();
            } catch (err: any) {
                console.error("Error initializing Google Sign-In:", err);
                setError(err.message);
                onError?.(err.message);
            }
        }

        async function handleCredentialResponse(response: any) {
            setIsLoading(true);
            setError(null);

            // response.credential contains the JWT ID token
            const idToken = response?.credential;

            if (!idToken) {
                const err = "No ID token received from Google";
                console.error(err);
                setError(err);
                onError?.(err);
                setIsLoading(false);
                return;
            }

            try {
                // Send ID token to backend for verification
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/auth/google`, {
                    method: "POST",
                    credentials: "include", // Important: send cookies
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id_token: idToken }),
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }));
                    throw new Error(errorData.detail || `HTTP ${res.status}`);
                }

                const userData = await res.json();
                console.log("✅ Google Sign-In successful:", userData);

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(userData);
                } else {
                    // Default behavior: redirect to dashboard
                    window.location.href = "/dashboard";
                }
            } catch (err: any) {
                console.error("❌ Google Sign-In failed:", err);
                const errorMessage = err.message || "Failed to authenticate with Google";
                setError(errorMessage);
                onError?.(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    }, [onSuccess, onError, buttonTheme, buttonSize, buttonText]);

    return (
        <div className="google-signin-wrapper">
            <div
                id="google-signin-button"
                aria-label="Sign in with Google"
                style={{ opacity: isLoading ? 0.6 : 1 }}
            />

            {isLoading && (
                <div style={{
                    marginTop: '12px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px'
                }}>
                    Signing in...
                </div>
            )}

            {error && (
                <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                }}>
                    {error}
                </div>
            )}

            <style jsx>{`
        .google-signin-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
        </div>
    );
}
