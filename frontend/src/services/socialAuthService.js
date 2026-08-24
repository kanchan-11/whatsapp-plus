import axios from 'axios';
import { authService } from './authService';

export const socialAuthService = {
  // Direct Google Sign In launching official Google OAuth popup
  async directGoogleSignIn() {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('GOOGLE_CLIENT_ID');

      if (!clientId || !clientId.trim()) {
        reject(
          new Error(
            'Google Sign-In Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID in frontend/.env.'
          )
        );
        return;
      }

      // 1. If Google GIS SDK is loaded on window
      if (window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId.trim(),
            scope: 'email profile openid',
            prompt: 'select_account',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                if (tokenResponse.error === 'popup_closed_by_user') {
                  reject(new Error('Google sign-in was closed'));
                } else {
                  reject(new Error(tokenResponse.error_description || tokenResponse.error));
                }
                return;
              }
              try {
                // Fetch real user profile directly from Google's UserInfo endpoint
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const { sub, name, email, picture } = userInfoRes.data;
                resolve({
                  provider: 'google',
                  providerId: sub,
                  name: name || email.split('@')[0],
                  email: email,
                  avatarUrl: picture,
                });
              } catch (err) {
                reject(err);
              }
            },
          });
          client.requestAccessToken();
          return;
        } catch (e) {
          console.warn('GIS TokenClient failed, falling back to direct OAuth popup', e);
        }
      }

      // 2. Direct Google OAuth2 Popup fallback
      const redirectUri = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId.trim()
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'GoogleSignIn',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        reject(new Error('Popup blocked by browser. Please allow popups for this site.'));
        return;
      }

      const pollTimer = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            reject(new Error('Google sign-in window was closed'));
            return;
          }

          let currentUrl = '';
          try {
            currentUrl = popup.location.href;
          } catch (e) {
            // Cross-origin access might throw while on Google origin, ignore
            return;
          }

          if (currentUrl && currentUrl.includes(redirectUri)) {
            const hash = popup.location.hash;
            if (hash && hash.includes('access_token=')) {
              clearInterval(pollTimer);
              popup.close();

              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');

              const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const { sub, name, email, picture } = userInfoRes.data;
              resolve({
                provider: 'google',
                providerId: sub,
                name: name || email.split('@')[0],
                email: email,
                avatarUrl: picture,
              });
            }
          }
        } catch (e) {
          // Cross-origin checks throw until redirect, ignore safely
        }
      }, 500);
    });
  },

  // Direct GitHub Sign In launching official GitHub OAuth popup
  async directGitHubSignIn() {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || localStorage.getItem('GITHUB_CLIENT_ID');

    // 1. If GitHub OAuth Client ID is configured, run native GitHub OAuth flow
    if (clientId && clientId.trim()) {
      return new Promise((resolve, reject) => {
        const redirectUri = window.location.origin;
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
          clientId.trim()
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;

        const width = 550;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          authUrl,
          'GitHubSignIn',
          `width=${width},height=${height},top=${top},left=${left}`
        );

        if (!popup) {
          reject(new Error('Popup blocked by browser. Please allow popups for this site.'));
          return;
        }

        const pollTimer = setInterval(async () => {
          try {
            // Check if popup closed safely
            let isClosed = false;
            try {
              isClosed = popup.closed;
            } catch (e) {
              // COOP policy might throw on popup.closed check while navigating github
            }

            if (isClosed) {
              clearInterval(pollTimer);
              reject(new Error('GitHub sign-in window was closed'));
              return;
            }

            let currentUrl = '';
            try {
              currentUrl = popup.location.href;
            } catch (e) {
              // Cross-origin navigation throws safely until redirected back to origin
              return;
            }

            if (currentUrl && currentUrl.includes(redirectUri)) {
              const search = popup.location.search;
              if (search && search.includes('code=')) {
                clearInterval(pollTimer);
                popup.close();

                const params = new URLSearchParams(search);
                const code = params.get('code');

                try {
                  const authData = await authService.githubOAuth(code, redirectUri);
                  resolve(authData);
                } catch (err) {
                  const msg = err.response?.data?.message || err.message || 'GitHub authentication failed';
                  reject(new Error(msg));
                }
              }
            }
          } catch (e) {
            // Ignore cross-origin exceptions safely during redirection
          }
        }, 500);
      });
    }

    // 2. Direct GitHub user connector fallback
    const username = window.prompt('Enter your GitHub username to sign in:');
    if (!username || !username.trim()) {
      throw new Error('GitHub sign-in was cancelled');
    }

    try {
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username.trim())}`);
      const data = res.data;
      const cleanLogin = (data.login || username || 'github_user').trim();
      const cleanName = (data.name && data.name.trim()) || cleanLogin;
      const cleanEmail = (data.email && data.email.trim()) || `${cleanLogin.toLowerCase()}@github.oauth`;
      const cleanAvatar = data.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanLogin}`;

      return {
        provider: 'github',
        providerId: String(data.id || Date.now()),
        name: cleanName,
        email: cleanEmail,
        avatarUrl: cleanAvatar,
      };
    } catch (e) {
      const cleanLogin = username.trim();
      return {
        provider: 'github',
        providerId: `github_${Date.now()}`,
        name: cleanLogin,
        email: `${cleanLogin.toLowerCase()}@github.oauth`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanLogin}`,
      };
    }
  },
};
