/**
 * Callbacks for common shared command options.
 */

import { shared } from "../locales/helpers.js"

/**
 * Description option
 *
 * @param  {SlashCommandStringOption} option Option to populate
 * @return {SlashCommandStringOption}        Populated option
 */
export function description(option) {
  return option
    .setName("description")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
    .setMaxLength(1500)
}

/**
 * Rolls option
 *
 * @param  {SlashCommandIntegerOption} option Option to populate
 * @return {SlashCommandIntegerOption}        Populated option
 */
export function rolls(option) {
  return option
    .setName("rolls")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
    .setMinValue(1)
    .setMaxValue(100)
}

/**
 * Secret option
 *
 * @param  {SlashCommandBooleanOption} option Option to populate
 * @return {SlashCommandBooleanOption}        Populated option
 */
export function secret(option) {
  return option
    .setName("secret")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
}

/**
 * Pool option
 *
 * @param  {SlashCommandIntegerOption} option Option to populate
 * @return {SlashCommandIntegerOption}        Populated option
 */
export function pool(option) {
  return option
    .setName("pool")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
    .setMinValue(1)
}

/**
 * Teamwork option
 *
 * @param  {SlashCommandBooleanOption} option Option to populate
 * @return {SlashCommandBooleanOption}        Populated option
 */
export function teamwork(option) {
  return option
    .setName("teamwork")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
}
