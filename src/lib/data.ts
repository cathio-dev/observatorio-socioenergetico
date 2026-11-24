import seed from '../data/seed.json'
import { createClient } from '@supabase/supabase-js'

export type Territory = { code: string; name: string; parent: string; geography_level: string; area_km2?: number }

export type Observation = {
  territory_code: string;
  indicator_code: string;
  indicator_name: string;
  unit: string;
  dimension: string;
  year: number;
  value: number;
  source_code: string;
  source: string;
  source_url: string;
  classification: string;
  definition: string;
  geography: string;
  limitations: string;
}

export type AppData = { territories: Territory[]; observations: Observation[]; connected: boolean }

const localData = seed as AppData

export async function loadData(): Promise<AppData> {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return { ...localData, connected: false }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('dashboard_observations').select('*').order('year')
  if (error) throw new Error(`Supabase: ${error.message}`)
  const observations = (data ?? []) as Observation[]
  const territoryMap = new Map<string, Territory>()
  for (const row of observations) territoryMap.set(row.territory_code, {
    code: row.territory_code, name: (row as Observation & { territory_name: string }).territory_name,
    parent: '', geography_level: row.geography,
  })
  return { territories: [...territoryMap.values()], observations, connected: true }
}



export const neighborhoodCodes = ['2927408018', '2927408117']
export const formatValue = (value: number, unit: string) => {
  if (unit === 'pessoas/km²') return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)
  if (unit === 'GWh') return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)
  if (unit === 'pessoas por domicílio') return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)
}
