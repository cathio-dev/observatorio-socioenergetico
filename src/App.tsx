import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { geoJSON as leafletGeoJSON } from 'leaflet'
import type { FeatureCollection } from 'geojson'
import { Activity, BookOpen, ChevronDown, CircleHelp, Database, FileText, Gauge, House, Layers3, Map as MapIcon, MapPinned, Menu, UsersRound, Zap } from 'lucide-react'
import { loadData, neighborhoodCodes, type AppData, type Observation } from './lib/data'
import { formatDifference, formatMeasure, isShare, relativeDifference, valueFor } from './lib/format'
import boundaries from './data/bairros.geojson?raw'

type Page = 'overview' | 'compare' | 'map' | 'energy' | 'method'
const pages: { id: Page; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Visão geral', icon: Layers3 },
  { id: 'compare', label: 'Comparar bairros', icon: Activity },
  { id: 'map', label: 'Mapa territorial', icon: MapIcon },
  { id: 'energy', label: 'Energia na Bahia', icon: Zap },
  { id: 'method', label: 'Fontes e método', icon: BookOpen },
]
const pageIds = pages.map((p) => p.id)
const colors: Record<string, string> = { '2927408018': '#406e61', '2927408117': '#d28d42' }
const names: Record<string, string> = { '2927408018': 'Beiru / Tancredo Neves', '2927408117': 'Pernambués' }
const shortNames: Record<string, string> = { '2927408018': 'Beiru / TN', '2927408117': 'Pernambués' }

/** Indicadores de bairro agrupados por tema (mesmo ano e mesma escala). */
const metricGroups: { label: string; metrics: Record<string, string> }[] = [
  { label: 'População e moradia', metrics: {
    population: 'População residente', population_density: 'Densidade populacional', dwellings_total: 'Domicílios totais',
    dwellings_occupied: 'Domicílios particulares ocupados', dwellings_occasional: 'Domicílios de uso ocasional',
    dwellings_vacant: 'Domicílios vagos', residents_per_occupied_dwelling: 'Moradores por domicílio ocupado',
  } },
  { label: 'Saneamento', metrics: {
    water_network_share: 'Abastecimento pela rede geral', sewer_network_share: 'Esgoto na rede geral ou pluvial',
    waste_collection_share: 'Coleta por serviço de limpeza', without_bathroom_share: 'Domicílios sem banheiro nem sanitário',
  } },
  { label: 'Renda', metrics: { income_average: 'Rendimento médio do responsável', income_median: 'Rendimento mediano do responsável' } },
  { label: 'Entorno urbano', metrics: {
    urban_paved_share: 'Face do domicílio com via pavimentada', urban_lighting_share: 'Face do domicílio com iluminação pública',
    urban_sidewalk_share: 'Face do domicílio com calçada', urban_no_trees_share: 'Face do domicílio sem árvores',
  } },
]
const metricLabels: Record<string, string> = Object.assign({}, ...metricGroups.map((g) => g.metrics))
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)
const tooltipStyle = { borderRadius: 12, border: '1px solid #e3e5df', boxShadow: '0 8px 24px #18342a12', fontSize: 12 }
const axisTick = { fill: '#5f665e', fontSize: 11 }

function observationsFor(data: AppData, indicator: string, year = 2022) {
  return data.observations.filter((o) => o.indicator_code === indicator && o.year === year && neighborhoodCodes.includes(o.territory_code))
}

function pageFromHash(): Page {
  const id = window.location.hash.replace('#/', '').replace('#', '') as Page
  return pageIds.includes(id) ? id : 'overview'
}

function MetricSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>{metricGroups.map((group) => <optgroup key={group.label} label={group.label}>{Object.entries(group.metrics).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</optgroup>)}</select>
}

function ChartCard({ title, eyebrow, children, note }: { title: string; eyebrow: string; children: ReactNode; note?: string }) {
  return <section className="chart-card"><div className="card-head"><div><div className="eyebrow">{eyebrow}</div><h3>{title}</h3></div></div>{children}{note && <p className="chart-note">{note}</p>}</section>
}

/** Barras dos dois bairros, sempre na mesma ordem e cor, com rótulo de valor visível (sem depender de hover). */
function CompareBars({ rows, title, compact = false }: { rows: Observation[]; title: string; compact?: boolean }) {
  const unit = rows[0]?.unit ?? ''
  const data = neighborhoodCodes.map((code) => ({ code, name: shortNames[code], value: valueFor(rows, code) }))
  const summary = data.map((d) => `${names[d.code]}: ${formatMeasure(d.value, unit, true)}`).join('; ')
  if (data.every((d) => d.value === null)) return <div className="chart-empty">Sem dados publicados para este indicador.</div>
  return <div className={compact ? 'chart-wrap compact' : 'chart-wrap'} role="img" aria-label={`${title}. ${summary}`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 10, left: 0, bottom: 8 }} barCategoryGap="42%">
        <CartesianGrid vertical={false} stroke="#e8e8df"/>
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} interval={0}/>
        <YAxis hide domain={[0, isShare(unit) ? 100 : 'auto']}/>
        <Tooltip formatter={(v) => [formatMeasure(Number(v), unit, true), 'Valor']} contentStyle={tooltipStyle} cursor={{ fill: '#f2f4ef' }}/>
        <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={54} isAnimationActive={false}>
          {data.map((d) => <Cell key={d.code} fill={colors[d.code]}/>)}
          <LabelList dataKey="value" position="top" formatter={(v: number) => formatMeasure(v, unit)} style={{ fill: '#34463b', fontSize: 11, fontWeight: 600 }}/>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}

/** Ajusta o mapa aos limites dos bairros carregados. */
function FitToBoundaries({ data }: { data: FeatureCollection }) {
  const map = useMap()
  useEffect(() => { map.fitBounds(leafletGeoJSON(data).getBounds(), { padding: [24, 24] }) }, [map, data])
  return null
}

const MAP_LOW = '#a9c5ad'
const MAP_HIGH = '#406e61'
const MAP_EQUAL = '#6f9886'
const MAP_EMPTY = '#d9ddd6'

function App() {
  const [page, setPageState] = useState<Page>(pageFromHash)
  const [data, setData] = useState<AppData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mapMetric, setMapMetric] = useState('population_density')
  const [compareMetric, setCompareMetric] = useState('population')
  const [energyYear, setEnergyYear] = useState<number | null>(null)

  const setPage = (next: Page) => {
    setPageState(next)
    setMenuOpen(false)
    if (window.location.hash !== `#/${next}`) window.history.pushState(null, '', `#/${next}`)
    window.scrollTo({ top: 0 })
  }
  useEffect(() => {
    const onHash = () => setPageState(pageFromHash())
    window.addEventListener('popstate', onHash)
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('popstate', onHash); window.removeEventListener('hashchange', onHash) }
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])
  useEffect(() => { document.title = `${pages.find((p) => p.id === page)?.label} | Observatório Socioenergético` }, [page])
  useEffect(() => { loadData().then(setData).catch((e: Error) => setLoadError(e.message)) }, [])

  const d = data ?? emptyData
  const latestYear = 2022
  const population = observationsFor(d, 'population', latestYear)
  const dwellings = observationsFor(d, 'dwellings_total', latestYear)
  const density = observationsFor(d, 'population_density', latestYear)
  const residents = observationsFor(d, 'residents_per_occupied_dwelling', latestYear)
  const sum = (rows: Observation[]) => rows.length ? rows.reduce((total, row) => total + row.value, 0) : null
  const totalPopulation = sum(population)
  const totalDwellings = sum(dwellings)
  const densest = [...density].sort((a, b) => b.value - a.value)[0]
  const popBeiru = valueFor(population, neighborhoodCodes[0])
  const popPern = valueFor(population, neighborhoodCodes[1])
  const popLarger = popBeiru !== null && popPern !== null ? (popPern >= popBeiru ? neighborhoodCodes[1] : neighborhoodCodes[0]) : null

  const energySeries = useMemo(() => (data?.observations ?? []).filter((o) => o.indicator_code === 'electricity_residential_consumption' && o.territory_code === 'BA').sort((a, b) => a.year - b.year).map((o) => ({ year: o.year, consumption: o.value })), [data])
  const energyYears = energySeries.map((row) => row.year)
  const activeEnergyYear = energyYear ?? energyYears[energyYears.length - 1] ?? null
  const energyRange = energyYears.length ? `${energyYears[0]}–${energyYears[energyYears.length - 1]}` : '—'
  const selectedEnergy = data?.observations.find((o) => o.indicator_code === 'electricity_residential_consumption' && o.territory_code === 'BA' && o.year === activeEnergyYear)
  const selectedConsumers = data?.observations.find((o) => o.indicator_code === 'electricity_residential_consumers' && o.territory_code === 'BA' && o.year === activeEnergyYear)
  const ivsSeries = useMemo(() => [2000, 2010].map((year) => {
    const value = (code: string) => data?.observations.find((o) => o.territory_code === '2927408' && o.indicator_code === code && o.year === year)?.value ?? null
    return { year: String(year), ivs: value('ivs'), renda: value('ivs_income_work'), capital: value('ivs_human_capital'), infraestrutura: value('ivs_urban_infrastructure') }
  }), [data])

  const compareRows = observationsFor(d, compareMetric)
  const compareUnit = compareRows[0]?.unit ?? ''
  const compareA = valueFor(compareRows, neighborhoodCodes[0])
  const compareB = valueFor(compareRows, neighborhoodCodes[1])

  const geojson = useMemo(() => JSON.parse(boundaries) as FeatureCollection, [])
  const mapRows = observationsFor(d, mapMetric, latestYear)
  const mapUnit = mapRows[0]?.unit ?? ''
  const mapValues = Object.fromEntries(neighborhoodCodes.map((code) => [code, valueFor(mapRows, code)])) as Record<string, number | null>
  const presentValues = Object.values(mapValues).filter((v): v is number => v !== null)
  const mapMax = presentValues.length ? Math.max(...presentValues) : 0
  const mapMin = presentValues.length ? Math.min(...presentValues) : 0
  const mapEqual = presentValues.length > 1 && mapMax === mapMin
  const shadeFor = (value: number | null) => value === null ? MAP_EMPTY : mapEqual ? MAP_EQUAL : value === mapMax ? MAP_HIGH : MAP_LOW
  const meterScale = isShare(mapUnit) ? 100 : Math.max(mapMax, 1)

  if (!data && !loadError) return <div className="loading" role="status"><span className="loading-dot"/> Abrindo observatório</div>

  return <div className="app-shell">
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true"/>}
    <aside id="sidebar" className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Zap size={20} fill="currentColor"/></div><div><div className="brand-name">território<span>·</span>energia</div><div className="brand-caption">OBSERVATÓRIO DE SALVADOR</div></div></div>
      <div className="workspace-label">PAINEL DE PESQUISA</div>
      <nav aria-label="Seções do observatório">{pages.map(({ id, label, icon: Icon }) => <a href={`#/${id}`} className={`nav-item ${page === id ? 'active' : ''}`} key={id} aria-current={page === id ? 'page' : undefined} onClick={(e) => { e.preventDefault(); setPage(id) }}><Icon size={17} aria-hidden="true"/><span>{label}</span>{page === id && <span className="nav-active-dot"/>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-status"><span className="status-dot"/><span>{data?.connected ? 'Banco conectado' : 'Prévia local'}</span></div><div className="profile"><div className="profile-avatar">SV</div><div><strong>Salvador, BA</strong><small>Censo 2022</small></div><ChevronDown size={15} aria-hidden="true"/></div></div>
    </aside>
    <main className="main-content" id="conteudo">
      <header className="topbar"><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={menuOpen} aria-controls="sidebar"><Menu size={20}/></button><div className="breadcrumbs">Observatório <span>/</span> {pages.find((p) => p.id === page)?.label}</div><div className="topbar-right"><span className="data-tag"><span/> DADOS OFICIAIS</span><div className="topbar-divider"/><span className="topbar-year">Censo 2022</span></div></header>
      {loadError && <div className="error-banner" role="alert"><Database size={16}/> Não foi possível consultar o Supabase. {loadError}</div>}
      {data && !data.connected && <div className="preview-banner"><span className="preview-pulse"/> Visualização local com snapshot oficial. Configure Supabase para consultar os dados persistidos.</div>}
      {page === 'overview' && <>
        <section className="page-intro"><div><div className="eyebrow intro-eyebrow">CADERNO TERRITORIAL <span>·</span> SALVADOR</div><h1>Energia, moradia<br/><em>e território.</em></h1><p>Um retrato baseado em dados públicos de dois bairros de Salvador. A leitura começa pelo que o Censo observou — e deixa explícito o que ainda precisa ser medido.</p></div><div className="intro-badge"><div className="badge-icon"><MapPinned size={20}/></div><div><strong>2 territórios</strong><span>Beiru / TN · Pernambués</span></div></div></section>
        <div className="overview-section-title"><div><span className="section-index">01</span><h2>Uma leitura de 2022</h2></div><span className="section-meta">Fonte principal · IBGE</span></div>
        <section className="stat-grid">
          <StatCard icon={UsersRound} label="População residente (soma)" value={formatMeasure(totalPopulation)} suffix="pessoas" tone="green" sub={`${formatMeasure(popBeiru)} Beiru / TN · ${formatMeasure(popPern)} Pernambués`}/>
          <StatCard icon={House} label="Domicílios totais (soma)" value={formatMeasure(totalDwellings)} suffix="domicílios" tone="sand" sub="Agregado por bairro · Censo 2022"/>
          <StatCard icon={Gauge} label="Maior densidade" value={formatMeasure(densest?.value ?? null)} suffix="pessoas/km²" tone="blue" sub={densest ? `${names[densest.territory_code]} · média do bairro` : 'Sem dado'}/>
          <StatCard icon={Activity} label="Diferença populacional" value={relativeDifference(popBeiru, popPern, 'pessoas')} suffix="a mais" tone="rose" sub={popLarger ? `${names[popLarger]} tem mais residentes` : 'Sem dado'}/>
        </section>
        <section className="chart-grid overview-charts">
          <ChartCard title="População residente" eyebrow="DEMOGRAFIA" note="Número de pessoas residentes em 2022; dado observado pelo IBGE."><CompareBars rows={population} title="População residente"/></ChartCard>
          <ChartCard title="Domicílios totais" eyebrow="MORADIA" note="Total conforme categorias do agregado básico do IBGE."><CompareBars rows={dwellings} title="Domicílios totais"/></ChartCard>
          <ChartCard title="Densidade populacional" eyebrow="FORMA URBANA" note="Indicador derivado: população residente dividida pela área oficial do bairro (pessoas/km²)."><CompareBars rows={density} title="Densidade populacional"/></ChartCard>
          <ChartCard title="Pessoas por domicílio ocupado" eyebrow="MORADIA" note="Média publicada no agregado básico do Censo."><CompareBars rows={residents} title="Pessoas por domicílio ocupado"/></ChartCard>
        </section>
        <section className="insight-strip"><div className="insight-icon"><FileText size={18}/></div><div><div className="eyebrow">LEITURA COM CUIDADO</div><p>Baixa renda ou moradia densa podem apontar riscos associados, mas <strong>não comprovam pobreza energética familiar.</strong> Para medir isso diretamente seriam necessários dados sobre gasto, acesso, qualidade do serviço e conforto térmico.</p></div><button className="text-button" onClick={() => setPage('method')}>Ver metodologia <span aria-hidden="true">→</span></button></section>
      </>}
      {page === 'compare' && <>
        <PageHeading eyebrow="COMPARAÇÃO TERRITORIAL" title="Dois bairros, lado a lado." description="Compare os registros censitários com a mesma unidade e o mesmo ano de referência."/>
        <div className="filter-row"><label htmlFor="compare-metric">Indicador</label><MetricSelect id="compare-metric" value={compareMetric} onChange={setCompareMetric}/><span className="filter-year">Referência · 2022</span></div>
        <div className="compare-feature"><div className="compare-main"><div className="eyebrow">{metricLabels[compareMetric]} · {compareUnit}</div><h2>{formatMeasure(compareA, compareUnit)} <span>vs.</span> {formatMeasure(compareB, compareUnit)}</h2><p>Beiru / Tancredo Neves <i/> Pernambués</p><CompareBars rows={compareRows} title={metricLabels[compareMetric]} compact/>{compareRows[0] && <div className="compare-def"><strong>{compareRows[0].classification === 'derivado' ? 'Indicador derivado' : 'Dado observado'}.</strong> {compareRows[0].definition.replace(/\.$/, '')}. {compareRows[0].limitations}</div>}</div>
          <div className="compare-difference"><span className="eyebrow">{isShare(compareUnit) ? 'DIFERENÇA EM PONTOS PERCENTUAIS' : 'DIFERENÇA ABSOLUTA'}</span><strong>{formatDifference(compareA, compareB, compareUnit)}</strong><span className="eyebrow">DIFERENÇA RELATIVA</span><strong>{relativeDifference(compareA, compareB, compareUnit)}</strong><small>{isShare(compareUnit) ? 'Para proporções, a comparação adequada é em pontos percentuais.' : 'Em relação ao menor valor observado.'}</small></div></div>
        <div className="comparison-table"><div className="table-title"><div><div className="eyebrow">QUADRO COMPARATIVO</div><h3>Indicadores dos bairros</h3></div><span>IBGE · Censo 2022</span></div><table><caption className="sr-only">Indicadores do Censo 2022 para Beiru / Tancredo Neves e Pernambués</caption><thead><tr><th scope="col">Indicador</th><th scope="col">Tipo</th><th scope="col">Unidade</th><th scope="col">Beiru / TN</th><th scope="col">Pernambués</th><th scope="col">Diferença</th></tr></thead><tbody>{Object.keys(metricLabels).map((code) => {
          const rows = observationsFor(d, code); const unit = rows[0]?.unit ?? ''; const a = valueFor(rows, neighborhoodCodes[0]); const b = valueFor(rows, neighborhoodCodes[1])
          return <tr key={code} className={code === compareMetric ? 'selected' : undefined}><th scope="row">{metricLabels[code]}</th><td><span className={`kind ${rows[0]?.classification ?? ''}`}>{rows[0]?.classification ?? '—'}</span></td><td>{unit || '—'}</td><td>{formatMeasure(a, unit)}</td><td>{formatMeasure(b, unit)}</td><td>{formatDifference(a, b, unit)}</td></tr>
        })}</tbody></table></div>
      </>}
      {page === 'map' && <>
        <PageHeading eyebrow="MAPA TEMÁTICO" title="A geografia importa." description="Os limites seguem a malha oficial de bairros do Censo 2022. Escolha uma camada para comparar os territórios."/>
        <div className="filter-row"><label htmlFor="map-metric">Camada</label><MetricSelect id="map-metric" value={mapMetric} onChange={setMapMetric}/><div className="map-legend" aria-label="Legenda do mapa">{mapEqual ? <><span className="legend-square" style={{ background: MAP_EQUAL }}/> Valores iguais</> : <><span className="legend-square" style={{ background: MAP_LOW }}/> Valor menor <span className="legend-square" style={{ background: MAP_HIGH }}/> Valor maior</>}</div></div>
        <div className="map-layout"><div className="map-panel"><MapContainer center={[-12.96, -38.46]} zoom={13} scrollWheelZoom={false} className="leaflet-map" aria-label="Mapa dos bairros Beiru / Tancredo Neves e Pernambués"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><FitToBoundaries data={geojson}/><GeoJSON key={`${mapMetric}-${data?.connected}`} data={geojson} style={(feature) => ({ color: '#193a31', weight: 2, fillColor: shadeFor(mapValues[String(feature?.properties?.code)] ?? null), fillOpacity: 0.82 })} onEachFeature={(feature, layer) => { const code = String(feature.properties?.code); layer.bindTooltip(`<strong>${names[code] ?? feature.properties?.name}</strong><br/>${metricLabels[mapMetric]}: ${formatMeasure(mapValues[code] ?? null, mapUnit, true)}`, { sticky: true }) }}/></MapContainer><div className="map-source">Limites: IBGE · Malha de bairros do Censo 2022</div></div>
          <aside className="map-side" aria-label="Valores da camada selecionada"><div className="eyebrow">{metricLabels[mapMetric]}</div><h3>Indicador por bairro</h3>{neighborhoodCodes.map((code) => { const value = mapValues[code] ?? null; const shade = shadeFor(value); return <div className="map-value" key={code}><div className="map-value-head"><span className="map-dot" style={{ background: shade }}/>{names[code]}<strong>{formatMeasure(value, mapUnit)}</strong></div><div className="meter" role="presentation"><span style={{ width: `${value === null ? 0 : Math.max(value / meterScale * 100, 3)}%`, background: shade }}/></div></div> })}<p className="map-unit">Unidade: {mapUnit || '—'}{isShare(mapUnit) ? ' · barra em escala de 0 a 100%' : ' · barra relativa ao maior valor'}</p><div className="map-caution"><CircleHelp size={16}/><p>Tom mais escuro significa valor numérico maior para a camada selecionada. Não significa, por si só, maior vulnerabilidade — em “sem árvores” ou “domicílios vagos”, por exemplo, o sentido é diferente de “iluminação pública”.</p></div></aside></div>
      </>}
      {page === 'energy' && <>
        <PageHeading eyebrow="CONTEXTO ENERGÉTICO" title="O estado como contexto." description="A série da EPE mostra consumo residencial e número de consumidores na Bahia. A escala estadual é mantida explícita."/>
        <div className="scope-callout"><div className="scope-icon"><Zap size={20}/></div><div><strong>Bahia · escala estadual</strong><span>Estes valores não são estimativas para Beiru / Tancredo Neves ou Pernambués.</span></div><span className="scope-tag">DADO OBSERVADO</span></div>
        <div className="filter-row energy-filter"><label htmlFor="energy-year">Ano de referência</label><select id="energy-year" value={activeEnergyYear ?? ''} onChange={(e) => setEnergyYear(Number(e.target.value))}>{energyYears.map((year) => <option value={year} key={year}>{year}</option>)}</select><span className="filter-year">Série disponível · {energyRange}</span></div>
        <section className="stat-grid energy-stats"><StatCard icon={Zap} label="Consumo residencial" value={formatMeasure(selectedEnergy?.value ?? null)} suffix={`GWh · ${activeEnergyYear ?? '—'}`} tone="green" sub="EPE · Anuário Estatístico 2026"/><StatCard icon={UsersRound} label="Consumidores residenciais" value={formatMeasure(selectedConsumers?.value ?? null)} suffix={`unidades · ${activeEnergyYear ?? '—'}`} tone="sand" sub="Unidades consumidoras na Bahia"/></section>
        <ChartCard title="Consumo residencial de eletricidade" eyebrow={`EPE · BAHIA · ${energyRange}`} note="Consumo na Bahia, em GWh. O ponto destacado é o ano selecionado. A escala estadual não permite inferir valores para bairros."><div className="chart-wrap energy-chart" role="img" aria-label={`Consumo residencial de eletricidade na Bahia, ${energyRange}. ${energySeries.map((r) => `${r.year}: ${fmt(Math.round(r.consumption))} GWh`).join('; ')}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={energySeries} margin={{ top: 20, right: 18, left: 6, bottom: 8 }}><CartesianGrid vertical={false} stroke="#e8e8df"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={axisTick}/><YAxis tickLine={false} axisLine={false} tick={axisTick} width={56} tickFormatter={(v: number) => fmt(v)} label={{ value: 'GWh', angle: -90, position: 'insideLeft', fill: '#5f665e', fontSize: 11 }}/><Tooltip formatter={(v) => [`${fmt(Math.round(Number(v)))} GWh`, 'Consumo']} contentStyle={tooltipStyle}/><Line type="monotone" dataKey="consumption" stroke="#406e61" strokeWidth={3} isAnimationActive={false} dot={(props: { cx?: number; cy?: number; payload?: { year: number } }) => { const active = props.payload?.year === activeEnergyYear; return <circle key={props.payload?.year} cx={props.cx} cy={props.cy} r={active ? 6 : 3} fill={active ? '#d28d42' : '#406e61'} stroke={active ? '#fff' : 'none'} strokeWidth={2}/> }} activeDot={{ r: 5 }}/></LineChart></ResponsiveContainer></div></ChartCard>
        <div className="energy-footnote"><span className="footnote-mark">i</span><p>O consumo agregado não indica qualidade ou continuidade do fornecimento, capacidade de pagamento ou conforto térmico das famílias. Essa análise exige pesquisas e dados em escala domiciliar.</p></div>
      </>}
      {page === 'method' && <>
        <PageHeading eyebrow="TRANSPARÊNCIA" title="De onde vêm os números." description="Cada leitura registra fonte, período, escala, definição e o limite do que permite concluir."/>
        <div className="method-cards"><MethodCard n="01" icon={Database} title="Dado observado" copy="Valor publicado diretamente pela fonte para o território e período indicados."/><MethodCard n="02" icon={Activity} title="Indicador derivado" copy="Cálculo reproduzível sobre variáveis oficiais, com fórmula declarada."/><MethodCard n="03" icon={CircleHelp} title="Proxy ou estimativa" copy="Aproximação de um fenômeno não medido diretamente; exige justificativa e cautela."/></div>
        <div className="source-list"><div className="table-title"><div><div className="eyebrow">REGISTRO DE FONTES</div><h3>Dados em uso</h3></div><span>atualizado em 14 nov. 2026</span></div>
          <SourceItem source="IBGE · Censo Demográfico 2022" detail="População, renda, domicílios e entorno urbano" scope="Bairro · 2022" href="https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/"/>
          <SourceItem source="IBGE · Malha de bairros" detail="Limites oficiais da Bahia · GeoPackage" scope="Bairro · 2022" href="https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/"/>
          <SourceItem source="EPE · Anuário Estatístico 2026" detail="Tabela 4.17 · consumo e consumidores residenciais" scope={`Bahia · ${energyRange}`} href="https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica"/>
          <SourceItem source="IPEA · Base IVS Municipal" detail="IVS geral e três dimensões · edição 2015" scope="Salvador · 2000 e 2010" href="https://www.ipea.gov.br/redeipea/images/excel/dados-ivs-municipal.zip"/>
        </div>
        <div className="ivs-card"><ChartCard title="IVS do município de Salvador" eyebrow="IPEA · 2000 E 2010 · ESCALA MUNICIPAL" note="Índice publicado pelo IPEA para o município de Salvador (0 = menor vulnerabilidade, 1 = maior). Não é um valor específico dos bairros do estudo."><div className="chart-wrap ivs-chart" role="img" aria-label={`IVS de Salvador. ${ivsSeries.map((r) => `${r.year}: IVS geral ${formatMeasure(r.ivs, 'índice')}`).join('; ')}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={ivsSeries} margin={{ top: 16, right: 14, left: 2, bottom: 4 }}><CartesianGrid vertical={false} stroke="#e8e8df"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={axisTick} padding={{ left: 30, right: 30 }}/><YAxis domain={[0, 1]} tickLine={false} axisLine={false} tick={axisTick} width={32}/><Tooltip formatter={(v, name) => [Number(v).toFixed(3), name]} contentStyle={tooltipStyle}/><Legend wrapperStyle={{ fontSize: 12, color: '#5f665e' }}/><Line name="IVS geral" type="linear" dataKey="ivs" stroke="#406e61" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false}/><Line name="Renda e trabalho" type="linear" dataKey="renda" stroke="#d28d42" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/><Line name="Capital humano" type="linear" dataKey="capital" stroke="#8295a0" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/><Line name="Infraestrutura urbana" type="linear" dataKey="infraestrutura" stroke="#ad796c" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false}/></LineChart></ResponsiveContainer></div></ChartCard></div>
        <section className="methodology-note"><div className="eyebrow">COMO INTERPRETAR</div><h3>Vulnerabilidade energética não cabe em um único número.</h3><p>O dashboard não converte renda, densidade ou iluminação pública em um diagnóstico de pobreza energética. Medidas diretas exigem informações sobre acesso, interrupções, gasto relativo à renda, equipamentos, conforto térmico e estratégias de restrição do consumo.</p><p>A malha usada corresponde ao Censo 2022. Mudanças de limites ou diferenças entre a nomenclatura local e a classificação oficial podem afetar a comparação. O nome do IBGE, “Beiru / Tancredo Neves”, é mantido junto ao código territorial para rastreabilidade.</p></section>
      </>}
      <footer className="page-footer"><span>OBSERVATÓRIO SOCIOENERGÉTICO DE SALVADOR</span><span>Dados públicos · leitura crítica · {data?.connected ? 'Supabase conectado' : 'prévia local'}</span></footer>
    </main>
  </div>
}

const emptyData: AppData = { territories: [], observations: [], connected: false }
function StatCard({ icon: Icon, label, value, suffix, tone, sub }: { icon: typeof Activity; label: string; value: string; suffix: string; tone: string; sub: string }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} aria-hidden="true"/></div><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-sub" title={sub}>{sub}</div></div> }
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <section className="page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></section> }
function MethodCard({ n, icon: Icon, title, copy }: { n: string; icon: typeof Activity; title: string; copy: string }) { return <article className="method-card"><div className="method-num">{n}</div><div className="method-icon"><Icon size={19} aria-hidden="true"/></div><h3>{title}</h3><p>{copy}</p></article> }
function SourceItem({ source, detail, scope, href }: { source: string; detail: string; scope: string; href: string }) { return <a className="source-item" href={href} target="_blank" rel="noreferrer"><div className="source-logo"><FileText size={18} aria-hidden="true"/></div><div className="source-copy"><strong>{source}</strong><span>{detail}</span></div><span className="source-scope">{scope}</span><span className="source-arrow" aria-hidden="true">↗</span><span className="sr-only">(abre em nova aba)</span></a> }

export default App
