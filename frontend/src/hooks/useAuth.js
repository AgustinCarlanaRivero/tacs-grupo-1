export function useAuth() {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: "seed-user-bruno",
      name: "Lionel Messi",
      email: "messi@afa.com",
      picture:
        "https://ui-avatars.com/api/?name=Lionel+Messi&background=002B5E&color=fff",
      sub: "mock|123456",
    },
    loginWithRedirect: () => {},
    logout: () => {},
    getAccessTokenSilently: async () => "mock-token",
  };
}
