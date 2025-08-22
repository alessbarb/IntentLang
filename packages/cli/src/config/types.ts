export interface ILConfig {
  compilerOptions?: {
    strict?: boolean;
    target?: "ts" | "js";
    outDir?: string;
    sourcemap?: boolean;
    seedRng?: string;
    seedClock?: string;
  };
  include?: string[];
  exclude?: string[];
}
