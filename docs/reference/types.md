# Types in IntentLang

IntentLang supports three main kinds of types: **brands**, **records**, and **unions**.

## Brands

Restrict a `String` with a name and a condition:

```intentlang
type Email = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
```

`where` acepta solo comparaciones simples o llamadas a funciones predefinidas. Las comparaciones usan `_` para referirse al valor del campo.

## Records

Collections of named fields. For more than three fields, use one line per field.

```intentlang
type User = {
  id: Uuid,
  name: String,
  email: Email,
  createdAt: DateTime,
};
```

## Unions

Combine tagged alternatives that must be handled exhaustively with `match`.

```intentlang
type Payment =
  | Card { last4: String where _.length == 4 }
  | Cash { received: Int where _ >= 0 };
```

### Match guards

Add an `if` condition after a pattern to further filter a case:

```intentlang
match payment {
  Card { last4 } if last4 == "0000" => /* ... */
  Cash { received } => /* ... */
}
```

The guard runs only after the pattern matches and must return `Bool`.
