import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import { Activity, BookOpen, ChevronDown, CircleHelp, Database, FileText, Gauge, House, Layers3, Map as MapIcon, MapPinned, Menu, UsersRound, Zap } from 'lucide-react'
import { loadData, formatValue, neighborhoodCodes, type AppData, type Observation } from './lib/data'
import boundaries from './data/bairros.geojson?raw'

type Page = 'overview' | 'compare' | 'map' | 'energy' | 'method'
const pages: { id: Page; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Visão geral', icon: Layers3 },
  { id: 'compare', label: 'Comparar bairros', icon: Activity },
  { id: 'map', label: 'Mapa territorial', icon: MapIcon },
  { id: 'energy', label: 'Energia na Bahia', icon: Zap },
  { id: 'method', label: 'Fontes e método', icon: BookOpen },
]
const colors = ['#406e61', '#d28d42']
const names: Record<string, string> = { '2927408018': 'Beiru / Tancredo Neves', '2927408117': 'Pernambués' }
const metricLabels: Record<string, string> = {
  population: 'População residente', dwellings_total: 'Domicílios totais', dwellings_occupied: 'Domicílios particulares ocupados',
  dwellings_occasional: 'Uso ocasional', dwellings_vacant: 'Domicílios vagos', population_density: 'Densidade populacional',
  residents_per_occupied_dwelling: 'Moradores por domicílio ocupado',
}
const fmt = (n: number) => new Intl.NumberFormat('pt-BR').format(n)

function observationsFor(data: AppData, indicator: string, year = 2022) {
  return data.observations.filter((o) => o.indicator_code === indicator && o.year === year && neighborhoodCodes.includes(o.territory_code))
}

function ChartCard({ title, eyebrow, children, note }: { title: string; eyebrow: string; children: ReactNode; note?: string }) {
  return <section className="chart-card"><div className="card-head"><div><div className="eyebrow">{eyebrow}</div><h3>{title}</h3></div><button className="icon-button" aria-label="Informações sobre o gráfico" title={note}><CircleHelp size={17}/></button></div>{children}{note && <p className="chart-note">{note}</p>}</section>
}

function CompareBars({ rows, unit = 'pessoas', compact = false }: { rows: Observation[]; unit?: string; compact?: boolean }) {
  const data = neighborhoodCodes.map((code) => ({ name: names[code], value: rows.find((r) => r.territory_code === code)?.value ?? 0 }))
  return <div className={compact ? 'chart-wrap compact' : 'chart-wrap'}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 12, right: 10, left: 0, bottom: 8 }} barCategoryGap="42%"><CartesianGrid vertical={false} stroke="#e8e8df"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#70746e', fontSize: 11 }} interval={0} tickFormatter={(v: string) => v === 'Beiru / Tancredo Neves' ? 'Beiru / TN' : v}/><YAxis hide/><Tooltip formatter={(v) => [`${fmt(Number(v))} ${unit}`, 'Valor']} contentStyle={{ borderRadius: 12, border: '1px solid #e3e5df', boxShadow: '0 8px 24px #18342a12' }}/><Bar dataKey="value" radius={[5,5,0,0]} maxBarSize={54}>{data.map((_, i) => <Cell key={i} fill={colors[i]}/>)}</Bar></BarChart></ResponsiveContainer></div>
}

function App() {
  const [page, setPage] = useState<Page>('overview')
  const [data, setData] = useState<AppData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mapMetric, setMapMetric] = useState('population_density')
  const [compareMetric, setCompareMetric] = useState('population')

  useEffect(() => { loadData().then(setData).catch((e: Error) => setLoadError(e.message)) }, [])
  const latestYear = 2022
  const population = observationsFor(data ?? emptyData, 'population', latestYear)
  const dwellings = observationsFor(data ?? emptyData, 'dwellings_total', latestYear)
  const density = observationsFor(data ?? emptyData, 'population_density', latestYear)
  const residents = observationsFor(data ?? emptyData, 'residents_per_occupied_dwelling', latestYear)
  const totalPopulation = population.reduce((sum, row) => sum + row.value, 0)
  const totalDwellings = dwellings.reduce((sum, row) => sum + row.value, 0)
  const latestEnergy = data?.observations.filter((o) => o.indicator_code === 'electricity_residential_consumption').sort((a,b) => b.year-a.year)[0]
  const energySeries = useMemo(() => (data?.observations ?? []).filter((o) => o.indicator_code === 'electricity_residential_consumption' && o.territory_code === 'BA').sort((a,b)=>a.year-b.year).map(o=>({year:o.year, consumption:o.value})), [data])
  const ivsSeries = useMemo(() => [2000, 2010].map((year) => {
    const value = (code: string) => data?.observations.find((o) => o.territory_code === '2927408' && o.indicator_code === code && o.year === year)?.value ?? null
    return { year, ivs: value('ivs'), renda: value('ivs_income_work'), capital: value('ivs_human_capital'), infraestrutura: value('ivs_urban_infrastructure') }
  }), [data])
  const selectedMetricRows = observationsFor(data ?? emptyData, mapMetric, latestYear)
  const mapValues = Object.fromEntries(selectedMetricRows.map((row) => [row.territory_code, row.value]))
  const geojson = JSON.parse(boundaries) as FeatureCollection
  const delta = totalPopulation ? Math.round(((population[1]?.value ?? 0) / (population[0]?.value ?? 1) - 1) * 100) : 0

  if (!data && !loadError) return <div className="loading"><span className="loading-dot"/> Abrindo observatório</div>

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Zap size={20} fill="currentColor"/></div><div><div className="brand-name">território<span>·</span>energia</div><div className="brand-caption">OBSERVATÓRIO DE SALVADOR</div></div></div>
      <div className="workspace-label">PAINEL DE PESQUISA</div>
      <nav>{pages.map(({ id, label, icon: Icon }) => <button className={`nav-item ${page === id ? 'active' : ''}`} key={id} onClick={() => { setPage(id); setMenuOpen(false) }}><Icon size={17}/><span>{label}</span>{id === 'overview' && <span className="nav-active-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-status"><span className="status-dot"/><span>{data?.connected ? 'Banco conectado' : 'Prévia local'}</span></div><div className="profile"><div className="profile-avatar">SV</div><div><strong>Salvador, BA</strong><small>Censo 2022</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir navegação"><Menu size={20}/></button><div className="breadcrumbs">Observatório <span>/</span> {pages.find(p=>p.id===page)?.label}</div><div className="topbar-right"><span className="data-tag"><span/> DADOS OFICIAIS</span><div className="topbar-divider"/><span className="topbar-year">Censo 2022</span></div></header>
      {loadError && <div className="error-banner"><Database size={16}/> Não foi possível consultar o Supabase. {loadError}</div>}
      {!data?.connected && <div className="preview-banner"><span className="preview-pulse"/> Visualização local com snapshot oficial. Configure Supabase para consultar os dados persistidos.</div>}
      {page === 'overview' && <>
        <section className="page-intro"><div><div className="eyebrow intro-eyebrow">CADERNO TERRITORIAL <span>·</span> SALVADOR</div><h1>Energia, moradia<br/><em>e território.</em></h1><p>Um retrato baseado em dados públicos de dois bairros de Salvador. A leitura começa pelo que o Censo observou — e deixa explícito o que ainda precisa ser medido.</p></div><div className="intro-badge"><div className="badge-icon"><MapPinned size={20}/></div><div><strong>2 territórios</strong><span>Beiru / TN · Pernambués</span></div></div></section>
        <div className="overview-section-title"><div><span className="section-index">01</span><h2>Uma leitura de 2022</h2></div><span className="section-meta">Fonte principal · IBGE</span></div>
        <section className="stat-grid">
          <StatCard icon={UsersRound} label="População residente" value={fmt(totalPopulation)} suffix="pessoas" tone="green" sub={`${fmt(population[0]?.value ?? 0)} Beiru / TN · ${fmt(population[1]?.value ?? 0)} Pernambués`}/>
          <StatCard icon={House} label="Domicílios totais" value={fmt(totalDwellings)} suffix="unidades" tone="sand" sub="Agregado por bairro · Censo 2022"/>
          <StatCard icon={Gauge} label="Maior densidade" value={formatValue(Math.max(...density.map((o)=>o.value),0),'pessoas/km²')} suffix="pessoas/km²" tone="blue" sub="Média territorial, não intrabairro"/>
          <StatCard icon={Activity} label="Diferença populacional" value={`${Math.abs(delta)}%`} suffix="entre bairros" tone="rose" sub={delta > 0 ? 'Pernambués tem mais residentes' : 'Beiru / TN tem mais residentes'}/>
        </section>
        <section className="chart-grid overview-charts">
          <ChartCard title="População residente" eyebrow="DEMOGRAFIA" note="Número de pessoas residentes em 2022; dado observado pelo IBGE."><CompareBars rows={population}/></ChartCard>
          <ChartCard title="Domicílios totais" eyebrow="MORADIA" note="Total conforme categorias do agregado básico do IBGE."><CompareBars rows={dwellings} unit="domicílios"/></ChartCard>
          <ChartCard title="Densidade populacional" eyebrow="FORMA URBANA" note="População residente dividida pela área oficial do bairro."><CompareBars rows={density} unit="pessoas/km²"/></ChartCard>
          <ChartCard title="Pessoas por domicílio ocupado" eyebrow="MORADIA" note="Média publicada no agregado básico do Censo."><CompareBars rows={residents} unit="pessoas por domicílio"/></ChartCard>
        </section>
        <section className="insight-strip"><div className="insight-icon"><FileText size={18}/></div><div><div className="eyebrow">LEITURA COM CUIDADO</div><p>Baixa renda ou moradia densa podem apontar riscos associados, mas <strong>não comprovam pobreza energética familiar.</strong> Para medir isso diretamente seriam necessários dados sobre gasto, acesso, qualidade do serviço e conforto térmico.</p></div><button className="text-button" onClick={()=>setPage('method')}>Ver metodologia <span>→</span></button></section>
      </>}
      {page === 'compare' && <>
        <PageHeading eyebrow="COMPARAÇÃO TERRITORIAL" title="Dois bairros, lado a lado." description="Compare os registros censitários com a mesma unidade e o mesmo ano de referência."/>
        <div className="filter-row"><label htmlFor="compare-metric">Indicador</label><select id="compare-metric" value={compareMetric} onChange={e=>setCompareMetric(e.target.value)}>{Object.entries(metricLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><span className="filter-year">Referência · 2022</span></div>
        <div className="compare-feature"><div className="compare-main"><div className="eyebrow">{metricLabels[compareMetric]}</div><h2>{fmt(observationsFor(data ?? emptyData, compareMetric)[0]?.value ?? 0)} <span>vs.</span> {fmt(observationsFor(data ?? emptyData, compareMetric)[1]?.value ?? 0)}</h2><p>Beiru / Tancredo Neves <i/> Pernambués</p><CompareBars rows={observationsFor(data ?? emptyData, compareMetric)} compact/></div><div className="compare-difference"><span className="eyebrow">DIFERENÇA ABSOLUTA</span><strong>{fmt(Math.abs((observationsFor(data ?? emptyData, compareMetric)[1]?.value ?? 0) - (observationsFor(data ?? emptyData, compareMetric)[0]?.value ?? 0)))}</strong><span className="eyebrow">DIFERENÇA PERCENTUAL</span><strong>{Math.abs(Math.round((((observationsFor(data ?? emptyData, compareMetric)[1]?.value ?? 0) / (observationsFor(data ?? emptyData, compareMetric)[0]?.value || 1)) - 1) * 100))}%</strong><small>Em relação ao menor valor observado.</small></div></div>
        <div className="comparison-table"><div className="table-title"><div><div className="eyebrow">QUADRO COMPARATIVO</div><h3>Indicadores observados</h3></div><span>IBGE · Censo 2022</span></div><table><thead><tr><th>Indicador</th><th>Unidade</th><th>Beiru / TN</th><th>Pernambués</th><th>Diferença</th></tr></thead><tbody>{Object.keys(metricLabels).map(code=>{const rows=observationsFor(data ?? emptyData,code);return <tr key={code}><td>{metricLabels[code]}</td><td>{rows[0]?.unit}</td><td>{fmt(rows[0]?.value??0)}</td><td>{fmt(rows[1]?.value??0)}</td><td>{fmt(Math.abs((rows[1]?.value??0)-(rows[0]?.value??0)))}</td></tr>})}</tbody></table></div>
      </>}
      {page === 'map' && <>
        <PageHeading eyebrow="MAPA TEMÁTICO" title="A geografia importa." description="Os limites seguem a malha oficial de bairros do Censo 2022. Escolha uma camada para comparar os territórios."/>
        <div className="filter-row"><label htmlFor="map-metric">Camada</label><select id="map-metric" value={mapMetric} onChange={e=>setMapMetric(e.target.value)}>{Object.entries(metricLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><div className="map-legend"><span className="legend-square green"/> Valor menor <span className="legend-square dark-green"/> Valor maior</div></div>
        <div className="map-layout"><div className="map-panel"><MapContainer center={[-12.96,-38.46]} zoom={12} scrollWheelZoom={false} className="leaflet-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><GeoJSON data={geojson} style={(feature)=>{const code=String(feature?.properties?.code);const value=mapValues[code]??0;const max=Math.max(...Object.values(mapValues),1);const fillColor=value>=max?'#406e61':'#a9c5ad';return { color: '#f7f8f4', weight: 2, fillColor, fillOpacity: 0.82 }}} onEachFeature={(feature,layer)=>{const code=String(feature.properties?.code);const val=mapValues[code];layer.bindTooltip(`<strong>${feature.properties?.name}</strong><br/>${fmt(val ?? 0)} ${selectedMetricRows[0]?.unit ?? ''}`)}}/></MapContainer><div className="map-source">Limites: IBGE · Malha de bairros do Censo 2022</div></div><aside className="map-side"><div className="eyebrow">{metricLabels[mapMetric]}</div><h3>Indicador por bairro</h3>{neighborhoodCodes.map((code)=>{const value=mapValues[code]??0;const max=Math.max(...Object.values(mapValues),1);const shade=value>=max?'#406e61':'#a9c5ad';return <div className="map-value" key={code}><div className="map-value-head"><span className="map-dot" style={{background:shade}}/>{names[code]}<strong>{fmt(value)}</strong></div><div className="meter"><span style={{width:`${Math.max(value/max*100,3)}%`,background:shade}}/></div></div>})}<div className="map-caution"><CircleHelp size={16}/><p>Tom mais escuro significa valor numérico maior para a camada selecionada. Não significa, por si só, maior vulnerabilidade.</p></div></aside></div>
      </>}
      {page === 'energy' && <>
        <PageHeading eyebrow="CONTEXTO ENERGÉTICO" title="O estado como contexto." description="A série da EPE mostra consumo residencial e número de consumidores na Bahia. A escala estadual é mantida explícita."/>
        <div className="scope-callout"><div className="scope-icon"><Zap size={20}/></div><div><strong>Bahia · escala estadual</strong><span>Estes valores não são estimativas para Beiru / Tancredo Neves ou Pernambués.</span></div><span className="scope-tag">DADO OBSERVADO</span></div>
        <section className="stat-grid energy-stats"><StatCard icon={Zap} label="Consumo residencial" value={latestEnergy ? fmt(latestEnergy.value) : '—'} suffix="GWh · 2025" tone="green" sub="EPE · Anuário Estatístico 2026"/><StatCard icon={UsersRound} label="Consumidores residenciais" value={fmt(data?.observations.find(o=>o.indicator_code==='electricity_residential_consumers' && o.year===2025)?.value??0)} suffix="unidades · 2025" tone="sand" sub="Unidades consumidoras na Bahia"/></section>
        <ChartCard title="Consumo residencial de eletricidade" eyebrow="EPE · BAHIA · 2011–2025" note="Consumo na Bahia, em GWh. A escala estadual não permite inferir valores para bairros."><div className="chart-wrap energy-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={energySeries} margin={{top:20,right:18,left:6,bottom:8}}><CartesianGrid vertical={false} stroke="#e8e8df"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fill:'#70746e',fontSize:11}}/><YAxis tickLine={false} axisLine={false} tick={{fill:'#70746e',fontSize:11}} width={46}/><Tooltip formatter={(v)=>[`${fmt(Number(v))} GWh`,'Consumo']} contentStyle={{borderRadius:12,border:'1px solid #e3e5df'}}/><Line type="monotone" dataKey="consumption" stroke="#406e61" strokeWidth={3} dot={{fill:'#406e61',strokeWidth:0,r:3}} activeDot={{r:5}}/></LineChart></ResponsiveContainer></div></ChartCard>
        <div className="energy-footnote"><span className="footnote-mark">i</span><p>O consumo agregado não indica qualidade ou continuidade do fornecimento, capacidade de pagamento ou conforto térmico das famílias. Essa análise exige pesquisas e dados em escala domiciliar.</p></div>
      </>}
      {page === 'method' && <>
        <PageHeading eyebrow="TRANSPARÊNCIA" title="De onde vêm os números." description="Cada leitura registra fonte, período, escala, definição e o limite do que permite concluir."/>
        <div className="method-cards"><MethodCard n="01" icon={Database} title="Dado observado" copy="Valor publicado diretamente pela fonte para o território e período indicados."/><MethodCard n="02" icon={Activity} title="Indicador derivado" copy="Cálculo reproduzível sobre variáveis oficiais, com fórmula declarada."/><MethodCard n="03" icon={CircleHelp} title="Proxy ou estimativa" copy="Aproximação de um fenômeno não medido diretamente; exige justificativa e cautela."/></div>
        <div className="source-list"><div className="table-title"><div><div className="eyebrow">REGISTRO DE FONTES</div><h3>Dados em uso</h3></div><span>atualizado em 14 nov. 2026</span></div>
          <SourceItem source="IBGE · Censo Demográfico 2022" detail="Agregados por bairro · v0001–v0009" scope="Bairro · 2022" href="https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/"/>
          <SourceItem source="IBGE · Malha de bairros" detail="Limites oficiais da Bahia · GeoPackage" scope="Bairro · 2022" href="https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/"/>
          <SourceItem source="EPE · Anuário Estatístico 2026" detail="Tabela 4.17 · consumo e consumidores residenciais" scope="Bahia · 2011–2025" href="https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/anuario-estatistico-de-energia-eletrica"/>
          <SourceItem source="IPEA · Base IVS Municipal" detail="IVS geral e três dimensões · edição 2015" scope="Salvador · 2000 e 2010" href="https://www.ipea.gov.br/redeipea/images/excel/dados-ivs-municipal.zip"/>
        </div>
        <div className="ivs-card"><ChartCard title="IVS do município de Salvador" eyebrow="IPEA · 2000 E 2010 · ESCALA MUNICIPAL" note="Índice publicado pelo IPEA para o município de Salvador. Não é um valor específico dos bairros do estudo."><div className="chart-wrap ivs-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={ivsSeries} margin={{top:16,right:14,left:2,bottom:4}}><CartesianGrid vertical={false} stroke="#e8e8df"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fill:'#70746e',fontSize:11}}/><YAxis domain={[0,1]} tickLine={false} axisLine={false} tick={{fill:'#70746e',fontSize:10}} width={32}/><Tooltip formatter={(v)=>[Number(v).toFixed(3),'IVS']} contentStyle={{borderRadius:12,border:'1px solid #e3e5df'}}/><Legend wrapperStyle={{fontSize:9,color:'#727b72'}}/><Line name="IVS geral" type="monotone" dataKey="ivs" stroke="#406e61" strokeWidth={2.5} dot={{r:4}}/><Line name="Renda e trabalho" type="monotone" dataKey="renda" stroke="#d28d42" strokeWidth={2} dot={{r:3}}/><Line name="Capital humano" type="monotone" dataKey="capital" stroke="#8295a0" strokeWidth={2} dot={{r:3}}/><Line name="Infraestrutura urbana" type="monotone" dataKey="infraestrutura" stroke="#ad796c" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer></div></ChartCard></div>
        <section className="methodology-note"><div className="eyebrow">COMO INTERPRETAR</div><h3>Vulnerabilidade energética não cabe em um único número.</h3><p>O dashboard não converte renda, densidade ou iluminação pública em um diagnóstico de pobreza energética. Medidas diretas exigem informações sobre acesso, interrupções, gasto relativo à renda, equipamentos, conforto térmico e estratégias de restrição do consumo.</p><p>A malha usada corresponde ao Censo 2022. Mudanças de limites ou diferenças entre a nomenclatura local e a classificação oficial podem afetar a comparação. O nome do IBGE, “Beiru / Tancredo Neves”, é mantido junto ao código territorial para rastreabilidade.</p></section>
      </>}
      <footer className="page-footer"><span>OBSERVATÓRIO SOCIOENERGÉTICO DE SALVADOR</span><span>Dados públicos · leitura crítica · {data?.connected ? 'Supabase conectado' : 'prévia local'}</span></footer>
    </main>
  </div>
}

const emptyData: AppData = { territories: [], observations: [], connected: false }
function StatCard({ icon: Icon, label, value, suffix, tone, sub }: { icon: typeof Activity; label: string; value: string; suffix: string; tone: string; sub: string }) {return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-sub">{sub}</div></div>}
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {return <section className="page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></section>}
function MethodCard({n,icon:Icon,title,copy}:{n:string;icon:typeof Activity;title:string;copy:string}) {return <article className="method-card"><div className="method-num">{n}</div><div className="method-icon"><Icon size={19}/></div><h3>{title}</h3><p>{copy}</p></article>}
function SourceItem({source,detail,scope,href}:{source:string;detail:string;scope:string;href:string}) {return <a className="source-item" href={href} target="_blank" rel="noreferrer"><div className="source-logo"><FileText size={18}/></div><div className="source-copy"><strong>{source}</strong><span>{detail}</span></div><span className="source-scope">{scope}</span><span className="source-arrow">↗</span></a>}

export default App
