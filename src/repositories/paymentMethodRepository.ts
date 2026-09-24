import {
  PaymentSettings,
  ExternalPaymentLink,
  PixPaymentConfig,
  BoletoPaymentConfig,
  PosMachineConfig,
} from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  id: 'payment-settings-rafaela',
  pix: {
    enabled: true,
    keyType: 'email',
    keyValue: 'rafaela.personal@email.com',
    beneficiaryName: 'Rafaela Santos Silva Personal',
    beneficiaryCity: 'Sao Paulo',
    bankName: 'Nubank / Banco Inter',
    instructions: 'Transfira o valor exato da parcela e envie o comprovante pelo WhatsApp da Rafaela.',
  },
  externalLinks: [
    {
      id: 'ext-infinitepay-1',
      provider: 'infinitepay',
      title: 'InfinitePay (Link Inteligente / PIX e Cartão)',
      url: 'https://loja.infinitepay.io/rafaela-personal',
      active: true,
      description: 'Menores taxas do mercado brasileiro. Aceita PIX imediato e parcelamento no cartão de crédito em até 12x.',
      createdAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'ext-pagbank-1',
      provider: 'pagbank',
      title: 'PagBank (UOL - Checkout Seguro)',
      url: 'https://pag.ae/7Z_rafaelapersonal',
      active: true,
      description: 'Checkout seguro PagBank UOL com opção de cartão de crédito parcelado, boleto e débito virtual.',
      createdAt: '2026-01-12T10:00:00.000Z',
    },
    {
      id: 'ext-pagseguro-1',
      provider: 'pagseguro',
      title: 'PagSeguro Transparente',
      url: 'https://pagseguro.uol.com.br/checkout/nc/v2/link.html?code=rafaela-personal',
      active: true,
      description: 'Link direto PagSeguro para pagamentos avulsos ou pacotes de personal.',
      createdAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 'ext-mercadopago-1',
      provider: 'mercadopago',
      title: 'Mercado Pago (Checkout Pro)',
      url: 'https://mpago.la/2rafaelapersonal',
      active: true,
      description: 'Pagamento com saldo da conta Mercado Pago, cartões salvos ou parcelado sem burocracia.',
      createdAt: '2026-01-20T10:00:00.000Z',
    },
    {
      id: 'ext-asaas-1',
      provider: 'asaas',
      title: 'Asaas Gestão de Cobranças',
      url: 'https://www.asaas.com/c/rafaela-personal-consultoria',
      active: true,
      description: 'Cobrança inteligente com régua de notificação automática e split bancário.',
      createdAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'ext-ton-1',
      provider: 'stone_ton',
      title: 'Ton / Stone (Link de Pagamento)',
      url: 'https://link.ton.com.br/rafaela-personal',
      active: false,
      description: 'Link de pagamento rápido da Stone/Ton para cartões de crédito e débito.',
      createdAt: '2026-02-10T10:00:00.000Z',
    },
  ],
  boleto: {
    enabled: true,
    provider: 'PagBank / Asaas',
    daysUntilDue: 3,
    lateFinePercentage: 2,
    monthlyInterestPercentage: 1,
    instructions: 'A compensação do boleto bancário pode levar de 24 a 72 horas úteis.',
  },
  posMachine: {
    enabled: true,
    provider: 'pagbank_celular',
    providerName: 'PagBank no Celular (Tap on Phone)',
    acceptedBrands: [
      'Visa',
      'Mastercard',
      'Elo',
      'American Express',
      'Hipercard',
      'Alelo',
      'VR',
      'Sodexo (Pluxee)',
    ],
    maxInstallments: 12,
    passFeeToStudent: false,
    instructions: 'Cobrança presencial por aproximação (NFC) diretamente pelo celular da personal na academia ou estúdio.',
  },
  updatedAt: new Date().toISOString(),
};

/**
 * Cálculo de CRC16-CCITT para Payload PIX padrão Banco Central do Brasil
 */
export function calculatePixCrc16(str: string): string {
  let crc = 0xffff;
  const strlen = str.length;

  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

/**
 * Remove acentuação e caracteres especiais para compatibilidade com o padrão EMV do BCB
 */
function cleanPixString(input: string, maxLen: number): string {
  const normalized = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
  return normalized.substring(0, maxLen);
}

/**
 * Formata um campo no padrão EMV TLV (Tag-Length-Value)
 */
function formatTlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export interface GeneratePixPayloadOptions {
  pixKey: string;
  beneficiaryName: string;
  beneficiaryCity: string;
  amount?: number;
  txId?: string;
  description?: string;
}

/**
 * Gera Payload oficial do PIX Copia e Cola (BR Code)
 */
export function generatePixEmvPayload(options: GeneratePixPayloadOptions): string {
  const { pixKey, beneficiaryName, beneficiaryCity, amount, txId = '***' } = options;

  const keyClean = pixKey.trim();
  const nameClean = cleanPixString(beneficiaryName || 'Rafaela Personal', 25);
  const cityClean = cleanPixString(beneficiaryCity || 'Sao Paulo', 15);
  const txClean = cleanPixString(txId || '***', 25) || '***';

  // Subcampo Merchant Account Information (Tag 26)
  const gui = formatTlv('00', 'br.gov.bcb.pix');
  const key = formatTlv('01', keyClean);
  const merchantAccountInfo = formatTlv('26', `${gui}${key}`);

  // Merchant Category Code (Tag 52)
  const mcc = formatTlv('52', '0000');

  // Moeda Real Brasileiro 986 (Tag 53)
  const currency = formatTlv('53', '986');

  // Valor (Tag 54) - opcional se não tiver valor fixo
  let amountStr = '';
  if (amount && amount > 0) {
    amountStr = formatTlv('54', amount.toFixed(2));
  }

  // País (Tag 58)
  const country = formatTlv('58', 'BR');

  // Nome do recebedor (Tag 59)
  const name = formatTlv('59', nameClean);

  // Cidade do recebedor (Tag 60)
  const city = formatTlv('60', cityClean);

  // Informações adicionais - txid (Tag 62)
  const referenceLabel = formatTlv('05', txClean);
  const additionalData = formatTlv('62', referenceLabel);

  // Payload Format Indicator (Tag 00)
  const payloadFormat = formatTlv('00', '01');

  // Montagem do payload parcial antes do CRC16
  const payloadBeforeCrc = `${payloadFormat}${merchantAccountInfo}${mcc}${currency}${amountStr}${country}${name}${city}${additionalData}6304`;

  // Cálculo e anexo do CRC16
  const crc = calculatePixCrc16(payloadBeforeCrc);
  return `${payloadBeforeCrc}${crc}`;
}

export interface IPaymentMethodRepository {
  getSettings(): Promise<PaymentSettings>;
  saveSettings(settings: PaymentSettings): Promise<PaymentSettings>;
  updatePix(config: Partial<PixPaymentConfig>): Promise<PaymentSettings>;
  addExternalLink(link: Omit<ExternalPaymentLink, 'id' | 'createdAt'>): Promise<ExternalPaymentLink>;
  updateExternalLink(id: string, updates: Partial<ExternalPaymentLink>): Promise<ExternalPaymentLink | null>;
  deleteExternalLink(id: string): Promise<boolean>;
  toggleExternalLink(id: string, active: boolean): Promise<ExternalPaymentLink | null>;
  updateBoleto(config: Partial<BoletoPaymentConfig>): Promise<PaymentSettings>;
  updatePosMachine(config: Partial<PosMachineConfig>): Promise<PaymentSettings>;
}

export class LocalPaymentMethodRepository implements IPaymentMethodRepository {
  async getSettings(): Promise<PaymentSettings> {
    const settings = getItem<PaymentSettings>(STORAGE_KEYS.PAYMENT_SETTINGS, INITIAL_PAYMENT_SETTINGS);
    return settings;
  }

  async saveSettings(settings: PaymentSettings): Promise<PaymentSettings> {
    const updated: PaymentSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return updated;
  }

  async updatePix(config: Partial<PixPaymentConfig>): Promise<PaymentSettings> {
    const current = await this.getSettings();
    const updated: PaymentSettings = {
      ...current,
      pix: {
        ...current.pix,
        ...config,
      },
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return updated;
  }

  async addExternalLink(data: Omit<ExternalPaymentLink, 'id' | 'createdAt'>): Promise<ExternalPaymentLink> {
    const current = await this.getSettings();
    const newLink: ExternalPaymentLink = {
      ...data,
      id: `ext-link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const updated: PaymentSettings = {
      ...current,
      externalLinks: [...current.externalLinks, newLink],
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return newLink;
  }

  async updateExternalLink(id: string, updates: Partial<ExternalPaymentLink>): Promise<ExternalPaymentLink | null> {
    const current = await this.getSettings();
    const index = current.externalLinks.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updatedLink: ExternalPaymentLink = {
      ...current.externalLinks[index],
      ...updates,
    };

    const links = [...current.externalLinks];
    links[index] = updatedLink;

    const updated: PaymentSettings = {
      ...current,
      externalLinks: links,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return updatedLink;
  }

  async deleteExternalLink(id: string): Promise<boolean> {
    const current = await this.getSettings();
    const filtered = current.externalLinks.filter((l) => l.id !== id);
    if (filtered.length === current.externalLinks.length) return false;

    const updated: PaymentSettings = {
      ...current,
      externalLinks: filtered,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return true;
  }

  async toggleExternalLink(id: string, active: boolean): Promise<ExternalPaymentLink | null> {
    return this.updateExternalLink(id, { active });
  }

  async updateBoleto(config: Partial<BoletoPaymentConfig>): Promise<PaymentSettings> {
    const current = await this.getSettings();
    const updated: PaymentSettings = {
      ...current,
      boleto: {
        ...current.boleto,
        ...config,
      },
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return updated;
  }

  async updatePosMachine(config: Partial<PosMachineConfig>): Promise<PaymentSettings> {
    const current = await this.getSettings();
    const updated: PaymentSettings = {
      ...current,
      posMachine: {
        ...current.posMachine,
        ...config,
      },
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PAYMENT_SETTINGS, updated);
    return updated;
  }
}

export const paymentMethodRepository = new LocalPaymentMethodRepository();
