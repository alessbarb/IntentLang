test operators {
  let n = 5;
  n += 3;
  n -= 1;
  n *= 2;
  n /= 3;
  n %= 2;
  n++;
  n--;
  let mask = (n & 6) | 3;
  let xor = mask ^ 1;
  let inv = ~xor;
  let left = xor << 1;
  let right = xor >> 1;
  let label = n > 0 ? "pos" : "neg";
}
