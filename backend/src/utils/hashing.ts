import bcrypt from "bcrypt";
export const hashString = (password: string) => {
  return bcrypt.hashSync(password, 10);
};
export const verifyString = (password: string, hashString: string) => {
  return bcrypt.compareSync(password, hashString);
}