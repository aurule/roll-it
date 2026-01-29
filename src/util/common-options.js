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
export function descriptionOption(option) {
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
export function rollsOption(option) {
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
export function secretOption(option) {
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
export function poolOption(option) {
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
export function teamworkOption(option) {
  return option
    .setName("teamwork")
    .setNameLocalizations(shared.mapped("name", option.name))
    .setDescription(shared.canonical("description", option.name))
    .setDescriptionLocalizations(shared.mapped("description", option.name))
}
