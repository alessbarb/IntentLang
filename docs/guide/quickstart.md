# Guía de inicio rápido

Esta guía muestra cómo escribir un archivo en IntentLang y generar el código TypeScript correspondiente.

## Prerrequisitos

- Node.js y pnpm instalados
- Dependencias del repositorio instaladas con:

```bash
pnpm install
```

## Crear un servicio simple

Crea `user_service.il` con el siguiente contenido:

```intentlang
intent "User service" tags ["api", "users"]

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

effect createUser(input: CreateUserInput): ResultUser uses http, clock { }
```

## Validar el archivo

```bash
pnpm --filter @il/cli ilc check user_service.il
```

## Generar TypeScript

```bash
pnpm --filter @il/cli ilc build user_service.il --target ts --out dist
```

Se creará `dist/user_service.ts` con tipos y stubs equivalentes, listo para completar la lógica.
