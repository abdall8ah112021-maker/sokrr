import { api } from '../api/client';

export interface BiometricDeviceHint {
  credentialId: string;
  phone: string;
  displayName: string;
  deviceName: string;
  enabledAt: string;
}

const BIOMETRIC_HINT_KEY = 'sugar_biometric_device';

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

export function isSecureWebAuthnContext(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function detectDeviceName(): string {
  if (typeof navigator === 'undefined') return 'جهاز شخصي';
  const ua = navigator.userAgent || '';
  if (/iPhone/i.test(ua)) return 'iPhone (Face ID / Touch ID)';
  if (/iPad/i.test(ua)) return 'iPad (Face ID / Touch ID)';
  if (/Android/i.test(ua)) return 'هاتف Android (بصمة الإصبع / الوجه)';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac (Touch ID)';
  if (/Windows/i.test(ua)) return 'Windows Hello';
  return 'متصفح موثوق';
}

export function getBiometricDeviceHint(): BiometricDeviceHint | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_HINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.credentialId && parsed.phone) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveBiometricDeviceHint(hint: BiometricDeviceHint): void {
  try {
    localStorage.setItem(BIOMETRIC_HINT_KEY, JSON.stringify(hint));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearBiometricDeviceHint(credentialId?: string): void {
  try {
    if (!credentialId) {
      localStorage.removeItem(BIOMETRIC_HINT_KEY);
      return;
    }
    const existing = getBiometricDeviceHint();
    if (existing && existing.credentialId === credentialId) {
      localStorage.removeItem(BIOMETRIC_HINT_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function mapWebAuthnError(err: any): Error {
  const name = err?.name || '';
  if (name === 'NotAllowedError') {
    return new Error('تم إلغاء التحقق بالبصمة أو انتهى الوقت المحدد، يمكنك المحاولة مجدداً.');
  }
  if (name === 'InvalidStateError') {
    return new Error('هذا الجهاز مسجل بالفعل ببصمة لهذا الحساب.');
  }
  if (name === 'NotSupportedError' || name === 'SecurityError') {
    return new Error('المتصفح أو الاتصال الحالي لا يدعم البصمة (يتطلب HTTPS أو اتصالاً آمناً).');
  }
  if (name === 'AbortError') {
    return new Error('تم إيقاف عملية التحقق البيومتري.');
  }
  return new Error(err?.message || 'تعذر إتمام التحقق بالبصمة على هذا الجهاز.');
}

export async function performBiometricRegistration(customDeviceName?: string) {
  if (!isWebAuthnSupported()) {
    throw new Error('متصفحك الحالي لا يدعم تسجيل الدخول بالبصمة أو الوجه (WebAuthn).');
  }
  if (!isSecureWebAuthnContext()) {
    throw new Error('تفعيل البصمة يتطلب فتح الموقع عبر اتصال آمن (HTTPS).');
  }

  const options = await api.getWebAuthnRegisterOptions();
  const deviceName = customDeviceName?.trim() || detectDeviceName();

  const publicKeyOptions: PublicKeyCredentialCreationOptions = {
    challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
    rp: {
      name: options.rp?.name || 'Sugar Business',
      id: window.location.hostname,
    },
    user: {
      id: base64UrlToUint8Array(options.user.id) as BufferSource,
      name: options.user.name,
      displayName: options.user.displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: 'none',
    excludeCredentials: (options.excludeCredentials || []).map((c: any) => ({
      id: base64UrlToUint8Array(c.id) as BufferSource,
      type: 'public-key' as const,
      transports: c.transports || ['internal'],
    })),
  };

  let createdCredential: PublicKeyCredential | null = null;
  try {
    createdCredential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;
  } catch (err: any) {
    throw mapWebAuthnError(err);
  }

  if (!createdCredential) {
    throw new Error('لم يتم إنشاء مفتاح البصمة على الجهاز.');
  }

  const response = createdCredential.response as AuthenticatorAttestationResponse;
  const publicKeyBuffer = typeof (response as any).getPublicKey === 'function'
    ? (response as any).getPublicKey()
    : null;
  const publicKeyAlgorithm = typeof (response as any).getPublicKeyAlgorithm === 'function'
    ? (response as any).getPublicKeyAlgorithm()
    : -7;
  const transports = typeof (response as any).getTransports === 'function'
    ? (response as any).getTransports()
    : ['internal'];

  const credentialId = arrayBufferToBase64Url(createdCredential.rawId);

  const result = await api.verifyWebAuthnRegister({
    challengeToken: options.challengeToken,
    deviceName,
    credential: {
      id: credentialId,
      rawId: credentialId,
      type: createdCredential.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
        attestationObject: arrayBufferToBase64Url(response.attestationObject),
        publicKey: publicKeyBuffer ? arrayBufferToBase64Url(publicKeyBuffer) : '',
        publicKeyAlgorithm,
        transports,
      },
    },
  });

  saveBiometricDeviceHint({
    credentialId,
    phone: options.user.name,
    displayName: options.user.displayName,
    deviceName,
    enabledAt: new Date().toISOString(),
  });

  return result;
}

export async function performBiometricAuthentication(phoneInput?: string) {
  if (!isWebAuthnSupported()) {
    throw new Error('متصفحك الحالي لا يدعم الدخول بالبصمة أو الوجه.');
  }
  if (!isSecureWebAuthnContext()) {
    throw new Error('الدخول بالبصمة يتطلب اتصالاً آمناً (HTTPS).');
  }

  const hint = getBiometricDeviceHint();
  const phone = phoneInput?.trim() || hint?.phone || '';
  const credentialIdHint = !phoneInput?.trim() ? hint?.credentialId : undefined;

  if (!phone && !credentialIdHint) {
    throw new Error('يرجى إدخال رقم الهاتف المسجل أولاً أو استخدام جهاز مفعّل عليه البصمة.');
  }

  const options = await api.getWebAuthnLoginOptions({
    phone: phone || undefined,
    credentialId: credentialIdHint,
  });

  const allowCredentials = (options.allowCredentials || []).map((c: any) => ({
    id: base64UrlToUint8Array(c.id) as BufferSource,
    type: 'public-key' as const,
    transports: c.transports || ['internal'],
  }));

  if (allowCredentials.length === 0) {
    clearBiometricDeviceHint();
    throw new Error('لم يتم العثور على بصمة مسجلة لهذا الحساب. يرجى الدخول بكلمة المرور ثم تفعيل البصمة.');
  }

  const publicKeyRequest: PublicKeyCredentialRequestOptions = {
    challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
    rpId: window.location.hostname,
    allowCredentials,
    userVerification: 'required',
    timeout: 60000,
  };

  let assertion: PublicKeyCredential | null = null;
  try {
    assertion = (await navigator.credentials.get({
      publicKey: publicKeyRequest,
    })) as PublicKeyCredential | null;
  } catch (err: any) {
    throw mapWebAuthnError(err);
  }

  if (!assertion) {
    throw new Error('تعذر استلام تأكيد البصمة من الجهاز.');
  }

  const response = assertion.response as AuthenticatorAssertionResponse;
  const assertionId = arrayBufferToBase64Url(assertion.rawId);

  const loginData = await api.verifyWebAuthnLogin({
    challengeToken: options.challengeToken,
    credential: {
      id: assertionId,
      rawId: assertionId,
      type: assertion.type,
      response: {
        clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
        signature: arrayBufferToBase64Url(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null,
      },
    },
  });

  if (loginData?.user?.phone) {
    saveBiometricDeviceHint({
      credentialId: assertionId,
      phone: loginData.user.phone,
      displayName: loginData.customer?.fullName || loginData.business?.businessName || loginData.user.phone,
      deviceName: detectDeviceName(),
      enabledAt: new Date().toISOString(),
    });
  }

  return loginData;
}
