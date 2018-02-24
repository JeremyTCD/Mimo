---
mimo_pageDescription: This is an example of an article with formatting.
mimo_pageTitle: Using External Resources
mimo_date: 11/02/2014
mimo_fontLinks:
  - link: https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,600i|Droid+Sans+Mono
---

# Using Images

## Inline Images
Display an image inline using a line of the form `![<alt-text>](<image-path> "<title>")`:
### Markdown
[!include-code] { 
    "src": "./usingExternalResources.md",
    "regions": [{"name": "inline-image-example" }],
    "highlight": false
}
### Result
<!-- <inline-image-example> -->
This image is inline: ![JeremyTCD's Logo](../../resources/logo.png "JeremyTCD's Logo")
<!-- </inline-image-example> -->

## Image Blocks
Use `[!include-image]<include-image-options>` to create an image block:
### Markdown
[!include-code] { 
    "src": "./usingExternalResources.md",
    "regions": [{"name": "include-image-example" }],
    "highlight": false
}
### Result
<!-- <include-image-example> -->
[!include-image]{ 
    "src":"../../resources/logo.png", 
    "title":"JeremyTCD's Logo", 
    "alt":"JeremyTCD's Logo", 
    "description":"JeremyTCD's Logo",
    "credits":"© 2017-2018 JeremyTCD"
}
<!-- </include-image-example> -->
### Result Markup
```no-highlight
TODO: display actual html here
```
### Details
`<include-image-options>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| src | string | true | This property's value is assigned to the `img` element's `src` attribute. |
| blockID | string | false | If specified, this property's value is assigned to the `img` element's `id` attribute. If unspecified, the `id` attribute of the nth image block is assigned a string of the form `image-block-n`.  |
| title | string | false | If specified, this property's value is assigned to the `img` element's `title` attribute. |
| alt | string | false | If specified, this property's value is assigned to the `img` element's `alt` attribute. |
| footerContent | string | false | If specified, this property's value is used as the `innerHTML` of the `footer` element. Also, if specified, the `description` and `credits` properties are ignored. This property's value can contain markup.  |
| description | string | false | If specified, this property's value is used as the `innerHTML` of the `span` element with class `image-description`. If the `footerContent` property is specified, this property is ignored. This property's value will be encoded as HTML-encoded text. |
| credits | string | false | If specified, this property's value is used as the `innerHTML` of the `span` element with class `image-credits`. If the `footerContent` property is specified, this property is ignored.  This property's value will be encoded as HTML-encoded text. |


# Including Code
Use `[!include-code]<include-code-options>` to create a code block:
 
## Markdown
[!include-code]{
    "src": "./usingExternalResources.md",
    "regions": [{"name": "include-code-examples" }],
    "highlight": false
}

## Result
<!-- <include-code-examples> -->
<!-- Include entire file -->
[!include-code]{ 
    "src":"../../resources/Example.cs",
    "language": "csharp",
    "title": "Entire File - Language: <language>, File Name: <fileName>",
    "showLineNumbers": true
}

<!-- Include regions -->
[!include-code]{ 
    "src":"../../resources/Example.cs",
    "regions": [{"name":"Region1", "lineBreak": "after"}, {"name": "Region2"}],
    "language": "csharp",
    "title": "Regions"
}

<!-- Include ranges -->
[!include-code]{ 
    "src":"../../resources/Example.cs",
    "ranges": [{"start": 4, "end": 5}, {"start": 7, "end": 10, "dedentLength": 0}, {"start": 19, "end": 19}],
    "language": "csharp",
    "title": "Ranges"
}
<!-- </include-code-examples> -->
## Result Markup
```no-highlight
TODO: display actual html here
```
## Details
`<include-code-options>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| src | string | true | A relative path or URL that identifies a text file. Only the HTTP and HTTPS protocols are supported for URLs. |
| ranges | `<range>`&nbsp;array | false | If specified, this property's value is used to clip the text file identified by `src`. Also, if specified, the `regions` property is ignored. |
| regions | `<region>`&nbsp;array | false | If specified, this property's value is used to clip the text file identified by `src`. |
| language | string | false | The [highlight.js](http://highlightjs.readthedocs.io/en/latest/css-classes-reference.html#language-names-and-aliases) alias for the code block's language. |
| highlight | boolean | false | If `true`, and `language` is specified and valid, highlights text in the code block according to `language`. |
| blockID | string | false | If specified, this property's value is assigned to the `.code-block` element's `id` attribute. If unspecified, the `id` attribute of the nth code block is assigned a string of the form `code-block-n`.  |
| title | string | false | If specified, this property's value is used as the `innerHTML` of the `.code-block-title` element. This property's value can contain two special tokens, `<fileName>` and `<language>`. `<fileName>` is replaced with the name of the file identified by `src` while `<language>` is replaced with the display name of the code block's language (inferred from `language` or the `src`'s extension). |

`<range>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| start | number | true | First line of the included range of lines, `[start, end]`. |
| end | number | true | Last line of the included range of lines, `[start, end]`. |
| dedentLength | number | false | Number of whitespace characters to remove from beggining of each line in the range. By default, removes the maximum common number of white space characters from each line. |
| lineBreak | string | false | Whether or not to create line breaks before and after a range. Can be one of the following strings: `none`, `before`, `after` or `both`. Has value `none` by default. |

`<region>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| name | string| true | Name of the region to include. The syntax for demarcating regions varies by language, full documentation can be found [here](https://dotnet.github.io/docfx/spec/docfx_flavored_markdown.html?tabs=tabid-1%2Ctabid-a#tag-name-representation-in-code-snippet-source-file). |
| dedentLength | number | false | Number of whitespace characters to remove from beggining of each line in the range. By default, removes the maximum common number of white space characters from each line. |
| lineBreak | string | false | Whether or not to create line breaks before and after a range. Can be one of the following strings: `none`, `before`, `after` or `both`. Has value `none` by default. |

# Including Markdown
Use `[!include-markdown]<include-markdown-options>` to include Markdown:
 
## Markdown
[!include-code]{
    "src": "./usingExternalResources.md",
    "regions": [{"name": "include-markdown-example" }],
    "highlight": false
}

## Result
<!-- <include-markdown-example> -->
<!-- Include entire file -->
[!include-markdown]{ 
    "src":"../../resources/Example.md"
}
<!-- </include-markdown-example> -->
## Result Markup
```no-highlight
TODO: display actual html here
```
## Details
`<include-markdown-options>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| src | string | true | A relative path or URL that identifies a text file. Only the HTTP and HTTPS protocols are supported for URLs. |
| ranges | `<range>`&nbsp;array | false | If specified, this property's value is used to clip the text file identified by `src`. Also, if specified, the `regions` property is ignored. |
| regions | `<region>`&nbsp;array | false | If specified, this property's value is used to clip the text file identified by `src`. |

`<range>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| start | number | true | First line of the included range of lines, `[start, end]`. |
| end | number | true | Last line of the included range of lines, `[start, end]`. |
| dedentLength | number | false | Number of whitespace characters to remove from beggining of each line in the range. By default, removes the maximum common number of white space characters from each line. |
| lineBreak | string | false | Whether or not to create line breaks before and after a range. Can be one of the following strings: `none`, `before`, `after` or `both`. Has value `none` by default. |

`<region>` must be a JSON object with the following properties:

| Property | Type | IsRequired | Notes |
| -------- | :----: | :----------: | ----- |
| name | string| true | Name of the region to include. The syntax for demarcating regions varies by language, full documentation can be found [here](https://dotnet.github.io/docfx/spec/docfx_flavored_markdown.html?tabs=tabid-1%2Ctabid-a#tag-name-representation-in-code-snippet-source-file). |
| dedentLength | number | false | Number of whitespace characters to remove from beggining of each line in the range. By default, removes the maximum common number of white space characters from each line. |
| lineBreak | string | false | Whether or not to create line breaks before and after a range. Can be one of the following strings: `none`, `before`, `after` or `both`. Has value `none` by default. |