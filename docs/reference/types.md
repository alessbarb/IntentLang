# Tipos en IntentLang

IntentLang soporta tres formas principales de tipos: **marcas**, **registros** y **uniones**.

## Marcas

Permiten restringir `String` mediante un nombre y una condición:

```intentlang
type Email = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
```

## Registros

Colecciones con campos nombrados. Para más de tres campos, usa una línea por campo.

```intentlang
type User = {
  id: Uuid,
  name: String,
  email: Email,
  createdAt: DateTime,
};
```

## Uniones

Combinan alternativas etiquetadas que se deben manejar exhaustivamente con `match`.

```intentlang
type Payment =
  | Card { last4: String where _.length == 4 }
  | Cash { received: Int where _ >= 0 };
```
