export type Fixed2 = number & Brand<"Fixed2">;
export function mul(a: Fixed2, b: Fixed2): Fixed2 {
  return fixed2Mul(a, b);
}
