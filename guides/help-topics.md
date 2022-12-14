# Help Topics Implementation Guide

This is a bare-bones guide to the elements of a help topic.

The help object looks like this:

```ts
{
    name: string,        // "topic-name"
    title: string,       // "Formatted Topic Name"
    description: string, // "a few clarifying words"
    help(): string       // "my very long help text"
}
```

(format is written in typescript, even though the bot uses javascript)

Requirements:

* The `name` must be unique across all help topics
* The `title` can be any short string for the topic's contents
* The `title` can be any descriptive string for the topic's contents
* The `help` method must return a string

## File Locations

Help topics live in the `/help` directory.
