import crypto from "node:crypto";

const createCode = (value: string): string => {
  value = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${value}-${crypto
  .randomUUID()
  .slice(0, 8)}`;
};

export default createCode;