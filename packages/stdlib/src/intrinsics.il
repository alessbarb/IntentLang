intent "Declaraciones de funciones nativas del runtime"

// El compilador entenderá `native func` como una función
// cuya implementación es provista por el runtime. No requiere cuerpo.
native func string_length(s: String): Int;

// De la misma forma, `native effect` se enlaza a una implementación
// del runtime que puede tener efectos secundarios.
native effect console_log(s: String): Void uses console;