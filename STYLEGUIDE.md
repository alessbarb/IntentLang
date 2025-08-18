# IntentLang Style Guide (v0.2)

This document defines the **canonical style rules** for writing IntentLang (IL).  
It is aimed at **developers and AIs generating IL code**.

---

## 1. File structure

A `.il` file must follow this order:

1. `intent` — short description + tags
2. `uses` — declared external capabilities (http, clock, random, …)
3. `types` — brand types → record types → union types
4. `func` — pure helper functions (no I/O)
5. `effect` — side-effecting functions with declared `uses`

👉 One **domain per file**. If you mix concerns, split into multiple `.il` files.

---

## 2. Naming conventions

- **Types** → `PascalCase` (e.g. `User`, `ApiError`, `CreateOrderInput`)
- **Functions, effects, fields** → `camelCase` (e.g. `createUser`, `createdAt`)
- **Capabilities** → noun, lowercased (e.g. `http`, `clock`, `random`)
- **Union constructors** → `PascalCase` (e.g. `Card { … } | Cash { … }`)

---

## 3. General rules

- ❌ No `null` or `undefined`  
  ✅ Use `Option<T>` or `Result<T,E>`

- ❌ No raw strings as errors  
  ✅ Define typed errors (e.g. `ApiError`)

- Effects must **always** declare their `uses`.

- Prefer **brands** (`Email`, `Uuid`, `Phone`) over plain strings.

- Records with more than 3 fields → one field per line.

- String literals → always **double quotes**.

---

## 4. Types

### Brands

```intentlang
type Email = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$")
```
````

### Records

```intentlang
type User = {
  id: Uuid,
  name: String where _.length >= 2,
  email: Email,
  createdAt: DateTime,
}
```

### Unions

```intentlang
type Payment =
  | Card { last4: String where _.length == 4, holder: String }
  | Cash { received: Int where _ >= 0 }
  | Wire { iban: String where _.length >= 15 }
```

👉 Always give constructors names (`Card`, `Cash`, `Wire`).
👉 Use `match` exhaustively:

```intentlang
func formatPayment(p: Payment): String {
  match p {
    Card { last4, holder } => "Card ****" + last4,
    Cash { received }      => "Cash " + toString(received),
    Wire { iban }          => "Wire " + iban,
  }
}
```

---

## 5. Functions vs Effects

- **`func`** → pure, deterministic, no I/O.
- **`effect`** → requires external capabilities.

```intentlang
// Pure helper
func toEmail(s: String): Result<Email, String> { }

// Effect with declared dependencies
effect createUser(input: CreateUserInput): Result<User, ApiError> uses http, clock { }
```

---

## 6. Errors and results

Always model errors with structured types:

```intentlang
type ApiError = { code: Int, message: String };
type ResultUser = Result<User, ApiError>;
```

Examples of common errors:

- `ValidationError { field: String, message: String }`
- `NotFound { resource: String, id: String }`
- `Conflict { reason: String }`
- `ExternalError { system: String, code: Int, message: String }`

---

## 7. Templates

### File skeleton

```intentlang
intent "Service name" tags ["tag1","tag2"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 2000 },
}

types {
  type <BrandName> = String brand "<BrandName>" where <predicate>;
  type <RecordName> = { field: Type, };
  type <UnionName> = | CaseA { ... } | CaseB;
}

func helper(arg: Type): Type { }

effect action(input: InputType): Result<Out,Err> uses http { }
```

### CRUD example

```intentlang
types {
  type ItemId = Uuid;
  type Item = { id: ItemId, name: String, createdAt: DateTime };
  type ItemError = { code: Int, message: String };
}

effect createItem(input: { name: String }): Result<Item, ItemError> uses http, clock { }
effect getItem(id: ItemId): Result<Item, ItemError> uses http { }
effect updateItem(id: ItemId, patch: { name: Option<String> }): Result<Item, ItemError> uses http { }
effect deleteItem(id: ItemId): Result<Bool, ItemError> uses http { }
```

---

## 8. Checklist before committing IL code

- [ ] Sections are ordered correctly
- [ ] All effects declare their `uses`
- [ ] All errors are typed (no raw strings)
- [ ] No unknown or undeclared types
- [ ] Unions use named constructors and `match` covers all cases
- [ ] Naming follows PascalCase/camelCase rules
- [ ] `Result<T,E>` or `Option<T>` used instead of `null`/`undefined`

---

✅ Following this style guide ensures **consistent, error-free IL code** that both humans and AIs can generate and read with confidence.
