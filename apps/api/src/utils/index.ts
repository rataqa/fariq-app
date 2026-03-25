export const base64 = {
  fromStr: (str: string) => Buffer.from(str, 'utf-8').toString('base64'),
};

const EMAIL_ADDRESS_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isEmailAddress(e: string) {
  return EMAIL_ADDRESS_PATTERN.test(e);
}
