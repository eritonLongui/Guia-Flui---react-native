export type ResultadoFala = {
  transcricao: string;
  final: boolean;
};

export type OuvintesFala = {
  onInicio?: () => void;
  onFim?: () => void;
  onResultado?: (resultado: ResultadoFala) => void;
  onErro?: (mensagem: string) => void;
};

export function reconhecimentoNativoDisponivel(): boolean {
  return false;
}

export async function pedirPermissaoFala(): Promise<boolean> {
  return false;
}

export function iniciarReconhecimentoFala(_contextualStrings?: string[]): void {}

export function pararReconhecimentoFala(): void {}

export function abortarReconhecimentoFala(): void {}

export function assinarReconhecimentoFala(_ouvintes: OuvintesFala): () => void {
  return () => {};
}
