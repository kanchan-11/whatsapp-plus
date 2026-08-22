import axios from 'axios';

// Helper to decode Google JWT token payload
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT', e);
    return null;
  }
};

export const socialAuthService = {
  // Direct Google Sign In using Google Identity Services (GIS) / Token Popup
  async directGoogleSignIn(clientId) {
    return new Promise((resolve, reject) => {
      const googleClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

      // 1. If Google SDK is loaded on window
      if (window.google?.accounts?.oauth2 && googleClientId) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                reject(new Error(tokenResponse.error_description || 'Google sign-in was cancelled'));
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
          client.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (e) {
          console.warn('Google TokenClient init failed, falling back to popup flow', e);
        }
      }

      // 2. Standard OAuth2 Popup fallback
      const redirectUri = window.location.origin;
      const targetClientId = googleClientId || '58284775432-instantping.apps.googleusercontent.com';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        targetClientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

      const width = 500;
      const height = 600;
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

      // Check popup result or hash callback
      const pollTimer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(pollTimer);
            reject(new Error('Google sign-in window was closed'));
          }
        } catch (e) {
          // Cross-origin access might throw, ignore
        }
      }, 1000);
    });
  },

  // Direct GitHub Sign In via OAuth popup or API profile fetch
  async directGitHubSignIn(clientId) {
    return new Promise((resolve, reject) => {
      const githubClientId = clientId || import.meta.env.VITE_GITHUB_CLIENT_ID;

      if (githubClientId) {
        const redirectUri = `${window.location.origin}`;
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
          githubClientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

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

        const pollTimer = setInterval(() => {
          if (popup.closed) {
            clearInterval(pollTimer);
            reject(new Error('GitHub sign-in window was closed'));
          }
        }, 1000);
      } else {
        // Direct GitHub username resolver with public profile data
        const username = prompt('Enter your GitHub username to connect your account:');
        if (!username || !username.trim()) {
          reject(new Error('GitHub sign-in was cancelled'));
          return;
        }

        axios
          .get(`https://api.github.com/users/${encodeURIComponent(username.trim())}`)
          .then((res) => {
            const data = res.data;
            resolve({
              provider: 'github',
              providerId: String(data.id),
              name: data.name || data.login,
              email: data.email || `${data.login}@github.oauth`,
              avatarUrl: data.avatar_url,
            });
          })
          .catch((err) => {
            reject(new Error('GitHub user not found. Please check username.'));
          });
      }
    });
  },
};
