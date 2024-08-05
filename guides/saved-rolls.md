# Saved Roll Implementation Guide

Basic guide to the requirements for a command to be savable.

Must have the following attributes:
```ts
{
    savable: boolean;
    changeable: Array<string>;
    schema: Joi.object;
    perform(rolls: number, description: string, ...options: Object): string;
}
```

`savable` indicates whether the command can be saved
`changeable` must be an array of options which can accept a numeric bonus, like the `modifier` or dice `pool`
`schema` must validate all options of the `perform()` method
perform must accept `rolls` and `description`, as these are considered universal options to all saved rolls
    a default should be supplied for `rolls`, since it is not always included in the saved options
