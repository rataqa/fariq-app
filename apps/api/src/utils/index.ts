export const base64 = {
  fromStr: (str: string) => Buffer.from(str, 'utf-8').toString('base64'),
};
