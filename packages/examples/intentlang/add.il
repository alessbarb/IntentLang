uses { random: Random { } }

func add(a: Int, b: Int): Int
  requires a >= 0 && b >= 0
  ensures _ >= a && _ >= b
{ return a + b; }

effect rollDie(): Int uses random {
  return ((random.next() * 6) >> 0) + 1;
}

test deterministic {
  let sum = add(1, 2);
  let first = rollDie();
  let second = rollDie();
}
