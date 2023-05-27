export const generateOTP = (n: number) => {
  let OTP = '';
  const possible = '0123456789';
  for (let i = 0; i < n; i++) {
    OTP += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return OTP;
};
