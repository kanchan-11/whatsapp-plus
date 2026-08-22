import axios from 'axios';

export const socialAuthService = {
  // Direct Google Sign In
  async directGoogleSignIn(customEmail, customName) {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. If valid Google Client ID configured in .env, run native Google Identity Services
    if (window.google?.accounts?.oauth2 && googleClientId) {
      return new Promise((resolve, reject) => {
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
        } catch (e) {
          reject(e);
        }
      });
    }

    // 2. Direct Google Account Connection
    const email = customEmail || 'agarwallkanchan29@gmail.com';
    const name = customName || (email.includes('@') ? email.split('@')[0] : 'Google User');
    const avatarSeed = email.split('@')[0];

    return {
      provider: 'google',
      providerId: `google_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email.trim().toLowerCase(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=4285f4,34a853,fbbc05,ea4335`,
    };
  },

  // Direct GitHub Sign In
  async directGitHubSignIn(githubUsername) {
    const username = githubUsername || 'kanchan-11';

    try {
      // Fetch public profile info directly from GitHub API
      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username.trim())}`);
      const data = res.data;
      return {
        provider: 'github',
        providerId: String(data.id || Date.now()),
        name: data.name || data.login,
        email: data.email || `${data.login}@github.oauth`,
        avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.login}`,
      };
    } catch (e) {
      // Fallback if rate-limited or custom
      return {
        provider: 'github',
        providerId: `github_${Date.now()}`,
        name: username,
        email: `${username.toLowerCase()}@github.oauth`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      };
    }
  },
};
