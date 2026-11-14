import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Card from './Card';
import { SectionLabel } from './UI';
import { BASE_COSTAS, BASE_FRENTE, MUSCULOS, URL_MUSCULOS } from '../data/musculos';
import { colors } from '../theme';

// Dimensões dos desenhos do wger (o corpo e o desenho de cada músculo têm alturas um pouco diferentes)
const LARGURA_SVG = 200;
const ALTURA_CORPO = 369;
const ALTURA_MUSCULO = 362;

// Cores dos músculos: vermelho do wger vira ciano (principal) e laranja vira azul (secundário)
const COR_PRINCIPAL = colors.cyan;
const COR_SECUNDARIO = colors.brand;

// Guarda os SVGs já baixados para não baixar de novo ao abrir outro exercício
const cache = new Map<string, Promise<string | null>>();

// Baixa o texto de um SVG (devolve null se falhar)
const buscarSvg = (url: string) => {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null)
        .then((texto) => {
          if (!texto) cache.delete(url);
          return texto;
        })
    );
  }
  return cache.get(url)!;
};

// Adiciona o viewBox (para o desenho escalar) e troca as cores do SVG
const prepararSvg = (xml: string, trocas: Record<string, string> = {}) => {
  const largura = /<svg[^>]*?\swidth="([\d.]+)"/.exec(xml)?.[1];
  const altura = /<svg[^>]*?\sheight="([\d.]+)"/.exec(xml)?.[1];
  let saida = xml;
  if (largura && altura && !/viewBox=/.test(xml)) {
    saida = saida.replace('<svg', `<svg viewBox="0 0 ${largura} ${altura}"`);
  }
  for (const [de, para] of Object.entries(trocas)) {
    saida = saida.replace(new RegExp(de, 'gi'), para);
  }
  return saida;
};

type Props = { principais: string[]; secundarios: string[] };

// Corpo (frente ou costas) com os músculos do exercício destacados
function Corpo({ base, musculos, largura, rotulo }: { base: string; musculos: string[]; largura: number; rotulo: string }) {
  const altura = (largura * ALTURA_CORPO) / LARGURA_SVG;
  const alturaMusculo = (largura * ALTURA_MUSCULO) / LARGURA_SVG;
  return (
    <View className="items-center">
      <View style={{ width: largura, height: altura }}>
        <SvgXml xml={base} width={largura} height={altura} style={{ position: 'absolute', opacity: 0.5 }} />
        {musculos.map((xml, i) => (
          <SvgXml key={i} xml={xml} width={largura} height={alturaMusculo} style={{ position: 'absolute' }} />
        ))}
      </View>
      <Text className="text-muted text-[11px] font-bold mt-2" style={{ letterSpacing: 1.6 }}>{rotulo}</Text>
    </View>
  );
}

// Seção "Foco muscular": mostra frente e costas com os músculos principais e secundários em destaque
export default function MapaMusculos({ principais, secundarios }: Props) {
  const { width } = useWindowDimensions();
  // Largura de cada corpo: tela menos margens da tela, do cartão e o espaço entre os dois
  const coluna = Math.floor((width - 48 - 40 - 12) / 2);

  const [svgs, setSvgs] = useState<Record<string, string>>({});
  const [falhou, setFalhou] = useState(false);

  // Músculos conhecidos, com o tipo (principal ou secundário); o que é principal não repete como secundário
  const itens = useMemo(() => {
    const lista = [
      ...principais.map((nome) => ({ nome, tipo: 'main' as const })),
      ...secundarios.filter((nome) => !principais.includes(nome)).map((nome) => ({ nome, tipo: 'secondary' as const })),
    ];
    return lista
      .filter((i) => MUSCULOS[i.nome])
      .map((i) => ({ ...i, ...MUSCULOS[i.nome], url: `${URL_MUSCULOS}/${i.tipo}/muscle-${MUSCULOS[i.nome].id}.svg` }));
  }, [principais, secundarios]);

  const chave = itens.map((i) => i.url).join('|');

  // Baixa o corpo e os desenhos dos músculos (com cache)
  useEffect(() => {
    let cancelado = false;
    const urls = [BASE_FRENTE, BASE_COSTAS, ...itens.map((i) => i.url)];
    Promise.all(urls.map((u) => buscarSvg(u).then((xml) => [u, xml] as const))).then((pares) => {
      if (cancelado) return;
      const mapa: Record<string, string> = {};
      for (const [url, xml] of pares) if (xml) mapa[url] = xml;
      if (!mapa[BASE_FRENTE] || !mapa[BASE_COSTAS]) setFalhou(true);
      else setSvgs(mapa);
    });
    return () => {
      cancelado = true;
    };
  }, [chave]);

  // Corpo sem cor e músculos já pintados, prontos para desenhar
  const preparados = useMemo(() => {
    const base = (url: string) => (svgs[url] ? prepararSvg(svgs[url]) : null);
    const desenhos = itens
      .filter((i) => svgs[i.url])
      .map((i) => ({
        frente: i.frente,
        xml: prepararSvg(svgs[i.url], { '#fc0000': COR_PRINCIPAL, '#f57900': COR_SECUNDARIO }),
      }));
    return { frente: base(BASE_FRENTE), costas: base(BASE_COSTAS), desenhos };
  }, [svgs, itens]);

  if (itens.length === 0 || falhou) return null;

  return (
    <View className="mt-6">
      <View className="mb-3">
        <SectionLabel tone="muted">Foco muscular</SectionLabel>
      </View>
      <Card className="p-5">
        {preparados.frente && preparados.costas ? (
          <>
            <View className="flex-row justify-between">
              <Corpo base={preparados.frente} musculos={preparados.desenhos.filter((d) => d.frente).map((d) => d.xml)} largura={coluna} rotulo="FRENTE" />
              <Corpo base={preparados.costas} musculos={preparados.desenhos.filter((d) => !d.frente).map((d) => d.xml)} largura={coluna} rotulo="COSTAS" />
            </View>
            <View className="flex-row justify-center mt-4" style={{ gap: 18 }}>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COR_PRINCIPAL }} />
                <Text className="text-muted text-xs font-bold">Principal</Text>
              </View>
              {itens.some((i) => i.tipo === 'secondary') && (
                <View className="flex-row items-center" style={{ gap: 6 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COR_SECUNDARIO }} />
                  <Text className="text-muted text-xs font-bold">Secundário</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View className="items-center justify-center" style={{ height: 120 }}>
            <ActivityIndicator color={colors.cyan} />
          </View>
        )}
      </Card>
    </View>
  );
}
