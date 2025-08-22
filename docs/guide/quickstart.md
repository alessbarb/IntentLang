# Quick Start Guide

This guide shows how to write an IntentLang file and generate the corresponding TypeScript code.

## Prerequisites

- Node.js and pnpm installed
- Repository dependencies installed:

```bash
pnpm install
```

## Create a simple service

Create `user_service.il` with the following content. The `tags` clause is optional and omitted here.

```intentlang
intent "User service"

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 2500 },
  clock: Clock { }
}

types {
  type Email  = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
  type UserId = Uuid;
  type User = {
    id: UserId,
    name: String where _.length >= 2,
    email: Email,
    createdAt: DateTime,
  };
  type CreateUserInput = { name: String, email: Email };
  type ApiError = { code: Int, message: String };
  type ResultUser = Result<User, ApiError>;
}

func toEmail(s: String): Result<String, String> { }

effect createUser(input: CreateUserInput): ResultUser uses http, clock
  requires input.name.length >= 2
  ensures _.id != ""
{ }

test create_user { let now = clock.now(); }
```

If needed, add tags after the service name, e.g. `intent "User service" tags ["api", "users"]`.

## Validate the file

```bash
pnpm --filter @intentlang/cli intent check user_service.il
```

## Generate TypeScript

```bash
pnpm --filter @intentlang/cli intent build user_service.il --target ts --out dist
```

`dist/user_service.ts` will contain equivalent types and stubs ready for business logic.

For reproducible results you can fix the pseudo-random generator and clock seeds:

```bash
pnpm --filter @intentlang/cli intent build user_service.il --seed-rng 1 --seed-clock 0
```

## Run tests

For files with `test` blocks, compile and run them with:

```bash
pnpm --filter @intentlang/cli intent test user_service.il
```

As with `build`, you may seed the RNG and clock to replay behavior exactly:

```bash
pnpm --filter @intentlang/cli intent test user_service.il --seed-rng 1 --seed-clock 0
```
