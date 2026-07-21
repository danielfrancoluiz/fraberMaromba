import { CadastroAlunoForm, FormErrors } from "@/types";

export function apenasNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = apenasNumeros(cpf);

  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += Number(cpfLimpo[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpfLimpo[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += Number(cpfLimpo[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(cpfLimpo[10]);
}

export function validarEmail(email: string): boolean {
  const emailLimpo = email.trim();
  const regex = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  return regex.test(emailLimpo);
}

export function validarTelefone(telefone: string): boolean {
  const numeros = apenasNumeros(telefone);
  return numeros.length === 10 || numeros.length === 11;
}

export function validarDataNascimento(data: string): string | null {
  const valor = data.trim();
  if (!valor) return "Campo obrigatório";

  const nascimento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return "Data de nascimento inválida";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (nascimento > hoje) return "Data de nascimento não pode ser futura";

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNascimento = nascimento.getMonth();
  const diaNascimento = nascimento.getDate();

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
    idade -= 1;
  }

  if (idade < 10 || idade > 100) {
    return "Aluno deve ter entre 10 e 100 anos";
  }

  return null;
}

export function validarPeso(peso: string): boolean {
  const valor = Number.parseFloat(peso.replace(",", "."));
  return Number.isFinite(valor) && valor >= 20 && valor <= 300;
}

export function validarAltura(altura: string): boolean {
  const valor = Number.parseFloat(altura.replace(",", "."));
  return Number.isFinite(valor) && valor >= 100 && valor <= 250;
}

export function validarNomeCompleto(nome: string): boolean {
  const valor = nome.trim();
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(valor)) return false;

  const palavras = valor.split(/\s+/).filter(Boolean);
  return palavras.length >= 2 && palavras.every((palavra) => palavra.length >= 2);
}

export function mascararCPF(valor: string): string {
  const numeros = apenasNumeros(valor).slice(0, 11);

  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

export function mascararTelefone(valor: string): string {
  const numeros = apenasNumeros(valor).slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

/** Máscara BRL digitando centavos: "9990" → "99,90" / "123456" → "1.234,56" */
export function mascararDinheiroBRL(valor: string): string {
  const digitos = apenasNumeros(valor).slice(0, 11);
  if (!digitos) return "";

  const centavos = Number.parseInt(digitos, 10);
  if (Number.isNaN(centavos)) return "";

  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte "1.234,56" (ou só dígitos) em centavos. */
export function dinheiroParaCentavos(valor: string): number | null {
  const digitos = apenasNumeros(valor);
  if (!digitos) return 0;
  const centavos = Number.parseInt(digitos, 10);
  if (Number.isNaN(centavos) || centavos < 0) return null;
  return centavos;
}

/** Exibe centavos já mascarados no input. */
export function centavosParaMascaraDinheiro(centavos: number): string {
  return mascararDinheiroBRL(String(Math.max(0, Math.floor(centavos))));
}

export function validarFormulario(dados: CadastroAlunoForm): FormErrors {
  const erros: FormErrors = {};

  if (!dados.nomeCompleto.trim()) {
    erros.nomeCompleto = "Campo obrigatório";
  } else if (!validarNomeCompleto(dados.nomeCompleto)) {
    erros.nomeCompleto = "Informe nome e sobrenome";
  }

  if (!dados.cpf.trim()) {
    erros.cpf = "Campo obrigatório";
  } else if (!validarCPF(dados.cpf)) {
    erros.cpf = "CPF inválido";
  }

  if (!dados.email.trim()) {
    erros.email = "Campo obrigatório";
  } else if (!validarEmail(dados.email)) {
    erros.email = "Email inválido";
  }

  if (!dados.telefone.trim()) {
    erros.telefone = "Campo obrigatório";
  } else if (!validarTelefone(dados.telefone)) {
    erros.telefone = "Telefone inválido. Use (00) 00000-0000";
  }

  if (!dados.sexo.trim()) {
    erros.sexo = "Campo obrigatório";
  }

  if (!dados.dataNascimento.trim()) {
    erros.dataNascimento = "Campo obrigatório";
  } else {
    const erroData = validarDataNascimento(dados.dataNascimento);
    if (erroData) erros.dataNascimento = erroData;
  }

  if (!dados.peso.trim()) {
    erros.peso = "Campo obrigatório";
  } else if (!validarPeso(dados.peso)) {
    erros.peso = "Peso deve ser entre 20kg e 300kg";
  }

  if (!dados.altura.trim()) {
    erros.altura = "Campo obrigatório";
  } else if (!validarAltura(dados.altura)) {
    erros.altura = "Altura deve ser entre 100cm e 250cm";
  }

  if (!dados.objetivo.trim()) {
    erros.objetivo = "Campo obrigatório";
  }

  if (!dados.planoId.trim()) {
    erros.planoId = "Campo obrigatório";
  }

  return erros;
}
