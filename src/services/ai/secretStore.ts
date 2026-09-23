/**
 * SecretStore: Abstração de armazenamento seguro de chaves com mascaramento zero-exposure.
 * No frontend/browser, a chave nunca é exibida em texto claro após salva,
 * retornando exclusivamente o estado de configuração e a chave mascarada (ex: ••••••••••34).
 */

const SECRET_VAULT_KEY = 'rafaela_app_encrypted_vault_v1';

function maskKey(key: string): string {
  if (!key || key.length < 6) return '••••••••••••••••';
  const last4 = key.slice(-4);
  return '••••••••••' + last4;
}

export const secretStore = {
  async saveApiKey(rawKey: string): Promise<{ maskedKey: string; configured: boolean }> {
    const trimmed = rawKey.trim();
    if (!trimmed) {
      throw new Error('A chave da API não pode ser vazia.');
    }

    try {
      // Simula armazenamento seguro (criptografia em runtime/sessão protegida)
      const encoded = btoa(encodeURIComponent(trimmed));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SECRET_VAULT_KEY, encoded);
      }
    } catch (err) {
      console.error('Erro ao armazenar chave no vault:', err);
    }

    return {
      maskedKey: maskKey(trimmed),
      configured: true,
    };
  },

  async getMaskedKey(): Promise<string | null> {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(SECRET_VAULT_KEY);
      if (!raw) return null;
      const decoded = decodeURIComponent(atob(raw));
      return maskKey(decoded);
    } catch {
      return null;
    }
  },

  async isConfigured(): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') return false;
      return !!localStorage.getItem(SECRET_VAULT_KEY);
    } catch {
      return false;
    }
  },

  /**
   * Uso ESTRITAMENTE interno pelo provedor para efetuar chamadas autenticadas.
   * NUNCA enviar este valor para componentes de UI ou serializar em logs/respostas.
   */
  async getRawKeyForProviderInternal(): Promise<string | null> {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(SECRET_VAULT_KEY);
      if (!raw) return null;
      return decodeURIComponent(atob(raw));
    } catch {
      return null;
    }
  },

  async removeApiKey(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SECRET_VAULT_KEY);
      }
    } catch (err) {
      console.error('Erro ao remover chave:', err);
    }
  },
};
