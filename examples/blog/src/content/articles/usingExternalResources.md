---
jtcd_pageDescription: This is an example of an article with formatting.
jtcd_pageTitle: Using External Resources
jtcd_date: 11/02/2014
jtcd_fontLinks:
  - link: https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,600i|Droid+Sans+Mono
---

# Using Images

# Embedding Code
## Embedding an Entire file
### Syntax
`[!code-<language>[<name>](<codepath>)]`  
### Example
`[!code-csharp[Example](../../resources/Example.cs)]` is rendered as:
[!code-csharp[Example](../../resources/Example.cs)]

## Embedding a Range of Lines
### Syntax
`[!code-<language>[<name>](<codepath>?start=<startline>&end=<endline>)]`  
### Example
`[!code-csharp[DoSomething](../../resources/Example.cs?start=6&end=9)]` is rendered as:
[!code-csharp[DoSomething](../../resources/Example.cs?start=6&end=9)]

## Embedding Multiple Ranges of Lines
### Syntax
`[!code-<language>[<name>](<codepath>?range=<startline>-<endline>,<startline>-<endline>,...)]`  
### Example
`[!code-csharp[Methods](../../resources/Example.cs?range=6-10,12-15)]` is rendered as:
[!code-csharp[Methods](../../resources/Example.cs?range=6-10,12-15)]

## Embedding a Range of Lines By Tagname
### Syntax
`[!code-<language>[<name>](<codepath>?name=<tagname>)]`  
### Example
`[!code-csharp[DoSomething](../../resources/Example.cs?name=Helpers)]` is rendered as:  
[!code-csharp[DoSomething](../../resources/Example.cs?name=Helpers)]
### Notes
DocFx matches `name` to different things in different languages, see [here](https://dotnet.github.io/docfx/spec/docfx_flavored_markdown.html?tabs=tabid-1%2Ctabid-a#tag-name-representation-in-code-snippet-source-file).

# Formatting Code Snippets
## Highlighting Lines
TODO: Does not work
### Syntax
`[!code-<language>[<name>](<codepath>?highlight=<startline>-<endline>,<startline>-<endline>,...)]`  
### Example
`[!code-csharp[Methods](../../resources/Example.cs?highlight=6-9,12-15)]` is rendered as:  
[!code-csharp[Methods](../../resources/Example.cs?highlight=6-9,12-15)]

## Dedenting Lines
TODO: Works inconsistently
### Syntax
`[!code-<language>[<name>](<codepath>?dedent=<dedentlength>)]`  
### Example
`[!code-csharp[Methods](../../resources/Example.cs?dedent=2)]` is rendered as:  
[!code-csharp[Methods](../../resources/Example.cs?dedent=2)]

# Embedding Markdown
[!include[markdown](./fileToEmbed.md)]  

Note: if used inline, for example, [!include[markdown](./fileToEmbed.md)], the markdown parser will treat the inserted text as inline content.

## Embedded SVG
[!include[logo](../../resources/logo.svg)]

Note: since markup in markdown is treated as raw markup, markup files (svg or html) can be inserted into an article.