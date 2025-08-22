# Diagnostic codes

IntentLang uses stable codes `ILCxxxx` for all diagnostics. The table below maps each code to its message template. Placeholders in `{}` are filled with context when reported.

| Code    | Message                                                                                   |
| ------- | ----------------------------------------------------------------------------------------- |
| ILC0201 | Duplicate type '{type}'.                                                                  |
| ILC0202 | Unknown type '{type}'.                                                                    |
| ILC0203 | Mixed literal and named constructors in union. Prefer a single style.                     |
| ILC0204 | Duplicate constructor '{ctor}' in union.                                                  |
| ILC0205 | '{kind}' must be Bool. Got {type}.                                                        |
| ILC0206 | Unknown function or effect '{name}' in test.                                              |
| ILC0207 | Return type mismatch: got {got}, expected {expected}.                                     |
| ILC0208 | If condition must be Bool. Got {type}.                                                    |
| ILC0209 | Unknown identifier '{name}'.                                                              |
| ILC0210 | Cannot resolve call target.                                                               |
| ILC0211 | '!' expects Bool. Got {type}.                                                             |
| ILC0212 | Unary '-' expects Number. Got {type}.                                                     |
| ILC0213 | Logical '{op}' expects Bool operands.                                                     |
| ILC0214 | '{op}' requires comparable operands. Got {left} and {right}.                              |
| ILC0215 | Relational '{op}' expects Number operands.                                                |
| ILC0216 | Arithmetic '{op}' expects Number operands.                                                |
| ILC0217 | Function '{name}' expects {expected} argument(s), got {got}.                              |
| ILC0218 | Argument {index} of '{name}' mismatch: got {got}, expected {expected}.                    |
| ILC0219 | Pattern must be a named constructor for this union.                                       |
| ILC0220 | Unknown case '{ctor}' for union. Did you mean '{suggestion}'?                             |
| ILC0221 | Unreachable duplicate case for constructor '{ctor}'.                                      |
| ILC0222 | Constructor '{ctor}' has no field '{field}'.                                              |
| ILC0223 | In a 'match' used as an expression, each case must be an expression (not a block).        |
| ILC0224 | Non-exhaustive match. Missing: {missing}.                                                 |
| ILC0225 | Pattern must be a literal for this union.                                                 |
| ILC0226 | Unknown literal case '{literal}'. Did you mean '{suggestion}'?                            |
| ILC0227 | Unreachable duplicate case for literal '{literal}'.                                       |
| ILC0228 | 'match' on non-union type {type} — exhaustiveness not enforced.                           |
| ILC0229 | Match guard must be Bool. Got {type}.                                                     |
| ILC0301 | Effect '{effect}' lists undeclared capability '{cap}'. Add it to 'uses { ... }'.          |
| ILC0302 | Pure function '{func}' cannot use capability '{cap}'.                                     |
| ILC0303 | Effect '{effect}' uses capability '{cap}' but it is not listed in 'uses' for this effect. |
| ILC0401 | Unknown flag or invalid combination of flags '{flags}' in 'uses' declaration.             |
| ILC0402 | File not found or empty pattern.                                                          |
| ILC0403 | Invalid configuration file.                                                               |
