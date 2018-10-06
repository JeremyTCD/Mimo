---
mimo_pageDescription: This is an example of an article with formatting.
mimo_pageTitle: Formatting Articles
mimo_date: 11/02/2014
mimo_socialMediaCard: true
mimo_shareOnFacebook: true
mimo_shareOnTwitter:
    hashtags: Mimo
    via: JeremyTCD
---

Formatting can be used to add order, meaning, and utility to your content. For example, headers can be used to categorize content, italicization can be used to emphasize things, and 
tables can be used to facilitate comparisons. This article covers all of the built-in ways to format your article.

## Code
### Inline Code
Create inline code by surrounding code with a pair of back-ticks:

```no-highlight
For example, you could inline a function declaration like `public int DoSomething()`.
```

For example, you could inline a function declaration like `public int DoSomething()`.

### Code Blocks
Create a code block by surrounding code with a pair of back-tick trios. You can append a language name from [this list](http://highlightjs.readthedocs.io/en/latest/css-classes-reference.html#language-names-and-aliases)
to the opening back-tick trio for language specific syntax highlighting:

[!include-code]{ 
    "src":"```csharp
public string CSharpFunction()
{
    return \"test\";
}
```

```typescript
public TypescriptFunction(): string {
    return \"test\";
}
```"
}

```csharp
public string CSharpFunction()
{
    return "test";
}
```

```typescript
public TypescriptFunction(): string {
    return "test";
}
```

## Blockquotes and Alerts
### Blockquote
Create a blockquote by prepending lines with `>` (optionally followed by a space, for better readability):

```no-highlight
> This is a blockquote.
```

> This is a blockquote.

### Note Alert
Create a note alert by beginning a blockquote with the line `> [!alert-note]`:

```no-highlight
> [!alert-note]
> This is a note alert.
```

> [!alert-note]
> This is a note alert.

### Warning Alert
Create a warning alert by beginning a blockquote with the line `> [!alert-warning]`:

```no-highlight
> [!alert-warning]
> This is a warning alert.
```

> [!alert-warning]
> This is a warning alert.
 
### Critical Warning Alert
Create a critical warning alert by beginning a blockquote with the line `> [!alert-critical-warning]`:

```no-highlight
> [!alert-critical-warning]
> This is a critical warning alert.
```

> [!alert-critical-warning]
> This is a critical warning alert.

### Formatting within Blockquotes and Alerts
If a sequence of lines creates `x`, then the same sequence of lines, with `>` appended to each line, creates `x` within a blockquote.
If an alert creation line, such as `>[!alert-note]` is appended to the blockquote, `x` is created within an alert:

```no-highlight
Paragraph one.

Paragraph two line one.  
Paragraph two line two.

- Item one
- Item two

> Paragraph one.
>
> Paragraph two line one.  
> Paragraph two line two.
>
> - Item one
> - Item two

> [!alert-note]
> Paragraph one.
>
> Paragraph two line one.  
> Paragraph two line two.
>
> - Item one
> - Item two
```

Paragraph one.

Paragraph two line one.  
Paragraph two line two.

- Item one
- Item two

> Paragraph one.
>
> Paragraph two line one.  
> Paragraph two line two.
>
> - Item one
> - Item two


> [!alert-note]
> Paragraph one.
>
> Paragraph two line one.  
> Paragraph two line two.
>
> - Item one
> - Item two

## Headings
Headings can be created at three levels:

```no-highlight
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

# H1
## H2
### H3
#### H4
##### H5
###### H6

# H1

## Horizontal Rules
To create a horizontal rule, use a line containing a sequence of three `*`, `-` or `_` characters:

```no-highlight
---

***

___

-*_
```

---

***

___

-*_

## Line Breaks and Paragraphs

### Line Breaks
To create a line break, append two spaces to the end of a line:

```no-highlight
Line one••
Line two
```

Line one  
Line two

### Paragraphs
To create a paragraph, leave an empty line after the last line of the preceding paragraph:

```no-highlight
Paragraph one line one••
Paragraph one line two

Paragraph two
```

Paragraph one line one  
Paragraph one line two

Paragraph two

## Links
By default, links to other sites open in a new tab.

### Basic Links
```no-highlight
[Absolute link](https://www.jeremytcd.com)

[Relative link](../index.md)

[Link with a title](https://www.jeremytcd.com "JeremyTCD")
```
[Absolute link](https://www.jeremytcd.com)

[Relative link](../index.md)

[Link with a title](https://www.jeremytcd.com "JeremyTCD")

> [!alert-note]
> Hover over the link to see the title.

### Raw URLs
```no-highlight
https://www.jeremytcd.com
```

https://www.jeremytcd.com

### Reference-Style Links
```no-highlight
[Reference-style link with a reference string][jeremytcd]

[Reference-style link with no reference string]

<!-- These references can be anywhere in the markdown file-->
[jeremytcd]: https://www.jeremytcd.com "JeremyTCD"  
[Reference-style link with no reference string]: https://www.jeremytcd.com "JeremyTCD"
```

[Reference-style link with a reference string][jeremytcd]

[Reference-style link with no reference string]

<!-- These references can be anywhere in the markdown file-->
[jeremytcd]: https://www.jeremytcd.com "JeremyTCD"  
[Reference-style link with no reference string]: https://www.jeremytcd.com "JeremyTCD"

### UID Links
```no-highlight
<xref:about>

[About](xref:about)
```
TODO xref should use page title instead of first H1  
<xref:about>

[About](xref:about)

## Lists
### Ordered Lists
An ordered list can be created using a sequence of lines of the form `<number>. <text>`:

```no-highlight
1. Item one
2. Item two
3. Item three
4. Item four
```

1. Item one
2. Item two
3. Item three
4. Item four

### Unordered Lists
An unordered list can be created using a sequence of lines of the form `*|-|+ <text>`:

```no-highlight
* Item one
* Item two
- Item three
- Item four
+ Item five
+ Item six
```

* Item one
* Item two
- Item three
- Item four
+ Item five
+ Item six

### Formatting within List Items
Say a sequence of lines creates `x`. The same sequence of lines, with the first line in the form of the first line of a list, for example `<number>. <text>`,
and all other lines prepended with two spaces, creates `x` within a list item.

```no-highlight
Paragraph one.

Paragraph two line one.•• 
Paragraph two line two.

- Nested item one
- Nested item two

1. Paragraph one.

••Paragraph two line one.••
••Paragraph two line two.

••- Nested item one
••- Nested item two
```

Paragraph one.

Paragraph two line one.  
Paragraph two line two.

- Nested item one
- Nested item two

1. Paragraph one.

  Paragraph two line one.  
  Paragraph two line two.

  - Nested item one
  - Nested item two

## Text Styles
### Italicized Text
Text can be italicized using a pair of asterisks or underscores:

```no-highlight
*Italicized using asterisks.*  

_Italicized using underscores._  
```

*Italicized using asterisks.*  

_Italicized using underscores._  

### Bold Text
Text can be bolded using two pairs of asterisks or underscores:

```no-highlight
**Bolded using asterisks.**  

__Bolded using underscores.__  
```

**Bolded using asterisks.**  

__Bolded using underscores.__  

### Italicized and Bold Text
Text can be italicized and bolded using a combination of asterisks and underscores:

```no-highlight
**_Italicized and bold._**  

*__Italicized and bold.__*  
```

**_Italicized and bold._**  

*__Italicized and bold.__*  

### Struck Through Text
Text can be struck through: 

```no-highlight
~~Struck through.~~  
```

~~Struck through.~~  

## Tables
At least 3 dashes must separate each header cell. Use colons to specify alignment. Pipes do not need to line up.

```no-highlight
| Left Aligned Column | Center Aligned Column | Right Aligned Column |
| :------------------ | :-------------------: | -------------------: |
| 0, 0 | 1, 0 | 2, 0 |
| 0, 1 | 1, 1 | 2, 1 |
| 0, 2 | 1, 2 | 2, 2 |
```

| Left Aligned Column | Center Aligned Column | Right Aligned Column |
| :------------------ | :-------------------: | -------------------: |
| 0, 0 | 1, 0 | 2, 0 |
| 0, 1 | 1, 1 | 2, 1 |
| 0, 2 | 1, 2 | 2, 2 |

## Tabs
```no-highlight
## [Tab One](#tab/tabid-1)

Tab one content

## [Tab Two](#tab/tabid-2)

Tab two content.

***
```

## [Tab One](#tab/tabid-1)

Tab one content

## [Tab Two](#tab/tabid-2)

Tab two content.

***

TODO should look something like this, requires custom markdown renderer and logic for indicator:

[!include-image]{ 
    "src":"../../resources/tabs.png"
}

## Further Reading
https://github.github.com/gfm