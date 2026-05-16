type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter = async () => null;

export function setTokenGetter(fn: TokenGetter): void {
  tokenGetter = fn;
}

export function getAccessToken(): Promise<string | null> {
  return tokenGetter();
}
