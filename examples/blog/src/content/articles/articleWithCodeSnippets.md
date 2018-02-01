---
jtcd_pageDescription: This is an example of an article with code snippets.
jtcd_pageTitle: Article with Code Snippets
jtcd_date: 11/02/2014
---

# Article with Code Snippets
## Embedding Code Snippets
### Embedding an Entire file
#### Syntax
`[!code-<language>[<name>](<codepath>)]`  

#### Example
`[!code-csharp[Example](../../resources/Example.cs)]`  

is rendered as  

[!code-csharp[Example](../../resources/Example.cs)]

### Embedding a Range of Lines
#### Syntax
`[!code-<language>[<name>](<codepath>?start=<start line>&end=<end line> "<title>")]`  

#### Example
`[!code-csharp[DoSomething](../../resources/Example.cs?start=3&end=6 "Example.DoSomething")]`  

is rendered as  

[!code-csharp[DoSomething](../../resources/Example.cs?start=3&end=6 "Example.DoSomething")]

### Embedding Multiple Ranges of Lines
#### Syntax
`[!code-<language>[<name>](<codepath>?range=<start line>-<end line>,<start line>-<end line>,... "<title>")]`  

#### Example
`[!code-csharp[Methods](../../resources/Example.cs?range=3-6,9-12)]`  

is rendered as  

[!code-csharp[Methods](../../resources/Example.cs?range=3-6,9-12)]

### Embedding a Range of Lines By Tagname
#### Syntax
`[!code-<language>[<name>](<codepath>?name=<tagname> "<title>")]`  

#### Example
`[!code-csharp[DoSomething](../../resources/Example.cs?name=Helpers)]`  

is rendered as  

[!code-csharp[DoSomething](../../resources/Example.cs?name=Helpers)]

#### Notes
DocFx matches `name` to different things in different languages, see [here](https://dotnet.github.io/docfx/spec/docfx_flavored_markdown.html?tabs=tabid-1%2Ctabid-a#tag-name-representation-in-code-snippet-source-file).


## Formatting Code Snippets
### Highlighting Lines
TODO: does not work

#### Syntax
`[!code-<language>[<name>](<codepath>?highlight=<start line>-<end line>,<start line>-<end line>,... "<title>")]`  

#### Example
`[!code-csharp[Methods](../../resources/Example.cs?highlight=3-6,9-12)]`  

is rendered as  

[!code-csharp[Methods](../../resources/Example.cs?highlight=3-6,9-12)]

#### Notes
Can be appended to the first four query strings.

### Dedenting Lines