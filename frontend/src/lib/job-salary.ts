export function formatJobSalary(
  min: number | string | null,
  max: number | string | null,
  currency = "VND",
) {
  if (min == null && max == null) return "Lương thỏa thuận";
  const unit = currency === "VND" ? "triệu" : currency;
  const amount = (value: number | string) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
      Number(value) / (currency === "VND" ? 1000000 : 1),
    );
  if (min == null) return `Lên đến ${amount(max!)} ${unit}`;
  if (max == null) return `Từ ${amount(min)} ${unit}`;
  if (Number(min) === Number(max)) return `${amount(min)} ${unit}`;
  return `${amount(min)} - ${amount(max)} ${unit}`;
}
