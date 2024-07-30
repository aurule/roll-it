# Parser Implementation Guide

This is a bare-bones guide to the elements of a parser.

The parser object looks like this:

```ts
{
    name: string,               // usually the name of the command this can parse
    parse(string): object,      // as from a command result presenter
}
```

(format is written in typescript, even though the bot uses javascript)

Requirements:

* The `name` *should* be the name of the command whose presented output can be parsed by this parser
* The `parse` function *must* accept a presented roll result from the named command and return an object of the options which were used for the roll which created that result. If there is an error, it *must* throw a `RollParseError`

## File Locations

Parsers live in the `/parsers` directory.
