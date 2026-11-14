import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the local environment.')

const dataset = JSON.parse(await readFile(new URL('../src/data/seed.json', import.meta.url), 'utf8'))
const client = createClient(url, serviceKey, { auth: { persistSession: false } })
const sourceCodes = new Map()
const indicatorRows = new Map()
const observationRows = []

for (const observation of dataset.observations) {
  const sourceCode = observation.source.startsWith('IBGE') ? 'ibge_censo_2022' : 'epe_anuario_2026'
  sourceCodes.set(sourceCode, { code: sourceCode, institution: observation.source.split(' - ')[0], title: observation.source.split(' - ').slice(1).join(' - '), url: observation.source_url })
  const dimension = observation.indicator_code.startsWith('electricity') ? 'energética' : observation.indicator_code.includes('dwelling') || observation.indicator_code.includes('residents_per') ? 'habitacional' : 'demográfica'
  indicatorRows.set(observation.indicator_code, {
    code: observation.indicator_code, name: observation.indicator_name, unit: observation.unit, dimension,
    description: observation.definition, classification: observation.classification,
    formula: observation.classification === 'derivado' ? observation.definition : null, limitations: observation.limitations,
  })
  observationRows.push({
    territory_code: observation.territory_code, indicator_code: observation.indicator_code, source_code: sourceCode,
    year: observation.year, value: observation.value, classification: observation.classification,
    definition: observation.definition, geography: observation.geography, limitations: observation.limitations,
  })
}

const upsert = async (table, rows, conflict) => {
  const { error } = await client.from(table).upsert(rows, { onConflict: conflict })
  if (error) throw new Error(`${table}: ${error.message}`)
}

await upsert('territories', dataset.territories.map((t) => ({ code: t.code, name: t.name, parent_name: t.parent, geography_level: t.geography_level, area_km2: t.area_km2 ?? null })), 'code')
await upsert('sources', [...sourceCodes.values()], 'code')
await upsert('indicators', [...indicatorRows.values()], 'code')
await upsert('observations', observationRows, 'territory_code,indicator_code,source_code,year')
console.log(`Loaded ${dataset.territories.length} territories and ${observationRows.length} observations.`)
