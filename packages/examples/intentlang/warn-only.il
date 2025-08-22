intent "warning-only fixture"

// Duplicate case produces an unreachable-branch warning (no errors)

types {
  type Letter = A | B;
}

func show(x: Letter): String {
  match x {
    A => "a"
    A => "again"   // <= duplicate; should warn as unreachable/duplicate
    B => "b"
  }
}
