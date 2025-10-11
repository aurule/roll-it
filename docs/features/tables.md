# Random Tables

Roll It lets you upload and roll results on your own random tables using the `/table` family of commands.

?> Like other commands, the `/table` commands can be used by anyone on the server by default. If you need to prevent accidental table changes, use the Server Settings to restrict `/table add` and `/table manage` to a trusted server role.

In general, you'll use `/table add` to create one or more tables, then `/table roll` to get a random entry from one of them.

You can use `/table list` to see which tables are available.

`/table manage` lets you see the details and full contents of a table, as well as remove it from the server. If you need to change something about a table, like tweak its name or change an entry, you'll have to remove the table and then add it back with the desired changes.

!> Each table on a server *must* have a unique name.

## Table File Requirements

Table files must be formatted in a simple, but specific way in order to be used by Roll It.

1. It has to be a plain text file. This means no excel files or PDfs. Be sure to use the `.txt` extension.
2. It has to be under 5 megabytes. That's roughly the size of a full-length novel.
3. It has to have at least two lines. Each line will become a single result on the table.
4. Each line has to be under 1500 characters.

?> A trailing newline on the last line of the file will be ignored instead of adding a blank entry.

## Sample Table Files

Here are some example tables that work with Roll It. They're ready to use immediately, or as the basis for your own table files.

* [Deck of Many Things (D&D 3.5e)](../samples/deck-of-many-things-35e.txt ':ignore')
* [Wand of Wonder (D&D 5e)](../samples/wand-of-wonder-5e.txt ':ignore')
