/**
 * Present the list of available tables
 *
 * @param  {obj[]}  tables Array of table info objects
 * @param  {i18n.t} t      Localization function
 * @return {str}           String with the table names and descriptions
 */
export function presentList(tables, t) {
  if (!tables.length) return t("response.none")

  const tables_list = tables.map((table) => t("response.entry", { table }))
  return t("response.filled", { count: tables.length, tables: tables_list })
}
