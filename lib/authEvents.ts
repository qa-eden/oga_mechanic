// Simple event emitter for auth events (logout on 401)
type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: AuthEventListener[] = [];

  subscribe(listener: AuthEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = {
  onUnauthorized: new AuthEventEmitter(),
};
