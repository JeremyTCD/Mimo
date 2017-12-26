<!-- 
Notes for this ReadMe 
- Be verbose if necessary. Not every reader will have experience with frontend developement.
- Be as accurate as possible with paths, e.g "blog/src/contents", not "src/contents". This improves clarity, especially since directories and files are sometimes copied around.
- Paths must be in italics
- Only qualify directories the first time they are mentioned, e.g "the blog directory". 
- Directories must be in italics.
- All headers must have a link in the table of contents 
-->

# BasicBlog 
[![Build status](https://ci.appveyor.com/api/projects/status/3gt21k5ah72ae31p?svg=true)](https://ci.appveyor.com/project/JeremyTCD/docfx-themes-basicblog)
<!--- Add test status once badge with logo is available https://github.com/badges/shields/pull/812 --->

### Table of Contents  
* [Summary](#summary)  
* [Prerequisites](#prerequisites)  
* [Creating Your Blog](#creating-your-blog) 
  * [Building and Serving Your Blog](#building-and-serving-your-blog)  
  * [Serving Your Blog in Watch Mode](#serving-your-blog-in-watch-mode)  
  * [Configuring Your Blog](#configuring-your-blog)
    * [Configuring at the Global Scope](#configuring-at-the-global-scope)
    * [Configuring at the Page Scope](#configuring-at-the-page-scope)
    * [Options](#options)
  * [Overriding BasicBlog](#overriding-basicblog)  
  * [Creating Articles](#creating-articles)
* [Publishing Your Blog](#publishing-your-blog)
* [Modifying BasicBlog](#modifying-basicblog)  
  * [Building BasicBlog](#building-basicblog)
  * [Serving BasicBlog in watch mode](#serving-basicblog-in-watch-mode)
* [Packing BasicBlog](#packing-basicblog)
* [Alternatives](#alternatives)  
* [Further Reading](#further-reading)  
* [Related Projects](#related-projects)
* [Contributions](#contributions)
* [License](#license)

## Summary
BasicBlog is a [DocFx](https://dotnet.github.io/docfx/) blog theme. It is inspired by the [default DocFx theme](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html).  

Features:

- A page with a list of article snippets sorted by date. 
- Cient side search with search results that contain article snippets.
- A menu displaying articles by category.
- Watch mode (explained [here](#serving-your-blog-in-watch-mode)). Displays changes in real time as you edit your blog.
- Lazily loaded Disqus comments.
- Google Analytics.
- Configurable and customizable architecture.
- Additionally, BasicBlog itself easy to modify:  
	- Scripts and styles are organized by component.
	- Logic is written in Typescript.
	- Styles are written in Scss.
	- Webpack powered watch mode (explained [here](#serving-basicblog-in-watch-mode)). Displays changes in real time as you modify BasicBlog. 

This ReadMe covers everything you need to know to create and publish your blog using the BasicBlog theme. It also covers everything you need to know to modify basic blog. This ReadMe is intentionally verbose so that it is accessible to the widest possible audience. 

## Prerequisites
Install the following command line tools if they aren't already installed:
1. [Yarn](https://yarnpkg.com/lang/en/docs/install/), the frontend/javascript package manager used to distribute BasicBlog.
2. [DocFx](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html#2-use-docfx-as-a-command-line-tool) command line tool.
3. [MSBuild](https://www.visualstudio.com/downloads/#other) command line tool (comes with "Build Tools for Visual Studio 2017"). 

## Creating Your Blog
### Building and Serving Your Blog
1. Clone this repository:
 
   ```
   C:\any\path> git clone https://github.com/JeremyTCD/DocFx.Themes.BasicBlog.git
   ```
   
2. Copy *docfx-themes-basicblog/examples/blog* to a new location. 
   
   The *blog* directory is a quickstart template. It has the following structure: 

   ```
   |-- /blog
       |-- /src
       |-- docfx.json
       |-- package.json
   ```    

   *src* contains the source files for your blog. *docfx.json* is your DocFx configuration file and *package.json* is your Yarn configuration file.

3. Install BasicBlog by running the following command in *blog*:

   ```
   C:\your\path\blog> yarn install
   ```
   
   This command generates a directory named *node_modules*. *node_modules* will have the following structure:
   
   ```
   |-- /node_modules
       |-- ...
       |-- /jeremytcd-docfx-themes-basicblog
           |-- /dist
               |-- /theme
               |-- /tools
           |-- ...
       |-- ...
   ```
   
   The *theme* directory is the BasicBlog DocFx theme. 
   
   Note: It was not necessary to specify what you were installing when you ran `yarn install` because *blog/package.json* is preconfigured with the necessary dependencies.

4. Build your blog by running the following command in *blog*, using an administrator shell: 
    
   ```
   C:\your\path\blog> yarn run build
   ```
   
   This command generates a directory named *_site*. *_site* contains your static site.
   
   Note: `build` is defined in *blog/package.json*. It deletes *_site* if it already exists then runs `docfx build`, which generates a new *_site*.

5. Serve your blog by running the following command in *blog*: 
    
   ```
   C:\your\path\blog> docfx serve _site
   ```
    
   To view your site, navigate to *localhost:8080*. 
   
   Note: *docfx serve* does not watch files for changes. It isn't very useful. Before continuing with the next section, kill the process (`ctrl + c`).
    
### Serving Your Blog in Watch Mode
Serve your blog in watch mode by running the following command in *blog*, using an 
administrator shell: 
    
```
C:\your\path\blog> yarn run serve [-- -l debug]

# Append "-- -l debug" to view debug level output.
```

This command runs `docfx build`, serves the site on port 3000 (navigate to *localhost:3000* to view it) and starts watching *blog/src*, *blog/docfx.json* and *blog/package.json*. Any change to a watched item causes `docfx build` to run again and reloads the page.

Note: DocFx has to rebuild the entire static site whenever changes are made. This is because DocFx has no built-in watch feature. At the time of writing, DocFx takes about 2.5 seconds to rebuild *docfx-themes-basicblog/examples/blog*. That is pretty slow, but beats manually running `docfx build` and refreshing the page on every change.
        
#### Example: Adding an article in watch mode
1. Ensure that you are serving your blog in watch mode. Navigate to *http://localhost:3000/articles/allArticles.html*.
2. In *blog/src/content/articles*, duplicate *exampleArticle4.md*. Rename the new file to *myFirstArticle.md*.
3. Open *myFirstArticle.md* in a text editor or IDE of your choice. Amend the following two lines:
    
   ```yaml
   ---
   ...
   jtcd.pageTitle: My First Article
   ...
   ---

   # My First Article
   ...
   ```

4. Open *blog/src/content/articles/toc.yml* in a text editor or IDE of your choice. Add the following properties to the end of the file: 

   ```yaml
   - name: My First Category
     items:
     - name: My First Article
       href: myFirstArticle.md
   
   # Note: Yaml, like Python, uses whitespace to delineate blocks.
   ```
   
   Your browser will reload the page automatically. The menu on the left will contain a new category named *My First Category*. This category will contain a new article named *My First Article*.

   Note: Refer to the [DocFx documentation](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html) to learn more about DocFx flavoured markdown, toc.yml files etc.

### Configuring Your Blog
Before we begin this section, some terms need to be defined: *article* and *page*. 

Markdown files in *blog/src/content* are converted into Html fragments by `docfx build`. Each Html fragment is inserted into an `<article>` element. Each `<article>` element is inserted into a Html page. 

In other words, each markdown file corresponds to a unique `<article>` element that resides in a unique Html page. For example, the file *blog/src/content/exampleArticle1.md* is converted into a Html fragment, then inserted into an `<article>` element, which in turn, is then inserted in a Html page named *exampleArticle1.html*.

Within the context of BasicBlog, *article* refers to an `<article>` element and its contents; *Page* refers to a Html page, which includes a header, menus, a footer, an article and more.

Configuration is done by specifying values for a set of options. Values can be specified at two scopes: the global scope and the page scope. A value specified at the global scope applies to all pages. A value specified at the page scope applies only to the configured page. Values specified at the page scope take precedence over values specified at the global scope.

####  Configuring at the Global Scope
Global scope values are specified in *blog/docfx.json*'s `build.globalMetadata` property.

##### Example: Setting article author at the global scope
1. Ensure that you are serving your blog in watch mode. Navigate to *localhost:8080/articles/exampleArticle1.html*.
2. Open *blog/docfx.json* in a text editor or IDE of your choice. Change the value assigned to `build.globalMetadata.jtcd.authorName` to your name: 

    ```
    "build": {
        ...
        "globalMetadata": {
            ...
            "jtcd.authorName": "<your name>",
            ...
        },
        ...
    }
    ```

    Your browser will reload the page automatically."\<your name>" will now be displayed just beneath the article title ("Example Article 1"). Navigate to other pages - "\<your name>" will be displayed as the author name by all pages. 
    
#### Configuring at the Page Scope
Page scope values are specified in markdown files. 

##### Example: Setting article author at the page scope
1. Ensure that you are serving your blog in watch mode. Navigate to *localhost:8080/articles/exampleArticle1.html*. 
2. Open *blog/src/content/articles/exampleArticle1.md* in a text editor or IDE of your choice. Add the property `jtcd.authorName` and assign it the value `Guest`: 

    ```yaml
    ---
    jtcd.authorName: Guest,
    ...
    ---
    ...
    ```

    Your browser should reload the page automatically. "Guest" will now be displayed just beneath the article title ("Example Article 1"). Navigate to other pages - "Guest" will not be displayed as the author name by any other page. 

#### Options
This is the full list of options. Each option is prepended with `jtcd.`. Note that some options, such as `jtcd.date`, are utilized in multiple categories.

##### Analytics
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.googleTrackingID | String | null | If defined, [Google Analytics](https://support.google.com/analytics/answer/1008015?hl=en) is added to the page. [Sign up](https://analytics.google.com/analytics/web/provision/?authuser=0#provision/SignUp/) with Google Analytics to get a tracking ID. |

##### Article
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.disableMetadata | Boolean | false |  If true, metadata is removed from the page's article. |
| jtcd.date | String | null | Value must be in [short date format (invariant culture)](https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#ShortDate), i.e mm/dd/yyyy. <br/><br/> If defined, the value is displayed as part of the page's article metadata. |
| jtcd.githubLink | String | null | If defined, the link is linked to in the page's article metadata. |
| jtcd.authorName | String | null | If defined, the string is displayed as part of the page's article metadata. |

##### Article List
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.includeInSal | Boolean  | true  | If true, the page's article is included in the article list. |
| jtcd.enableSal  | Boolean | false  | If true, the article list is inserted into the page. |
| jtcd.salSnippetLength | Integer | 500  | Length of the page's article snippet in the article list. |
| jtcd.date | String | null | Value must be in [short date format (invariant culture)](https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#ShortDate), i.e mm/dd/yyyy.<br><br> If defined, the date is used to sort pages in the article list. Note that if a page does not define a valid `jtcd.date` but has `jtcd.includeInSal` set to true, `docfx build` will fail. |

##### Breadcrumbs
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.disableBreadcrumbs | Boolean | false | If true, breadcrumbs are removed from the page. |

##### Comments
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.disableComments | Boolean | false | If true, comments are removed from the page.|
| jtcd.disqusShortname | String | null | [Disqus Shortname](https://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables#shortname) for the page's comments. [Sign up](https://disqus.com/profile/signup/) with Disqus to get a shortname.<br/><br/> If undefined or an empty string, comments are removed from the page. |
| jtcd.pageTitle | String | null | [Disqus Identifier](https://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables#thispageidentifier) for the page's comments.<br/><br/> If undefined or an empty string, comments are removed from the page. |

##### Footer
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.githubLink | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.twitterLink | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.instagramLink | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.facebookLink | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.googleplusLink | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.licenseRelPath | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.privacyRelPath | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.contactRelPath | String | null | If defined, the link is linked to in the page's footer. |
| jtcd.copyrightText | String | null | If defined, the string is displayed as part of the page's footer. |

##### Head
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.pageTitle | String | null | If defined, the string is added to the [title element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title). The string is also added to a [meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) for search engine optimization.<br/><br/> If undefined, an empty string is used in its place.|
| jtcd.websiteName | String | null | If defined, the string is added to the [title element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title). The string is also added to a [meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) for search engine optimization.<br/><br/> If undefined, an empty string is used in its place.|
| jtcd.pageDescription | String | null | If defined, the string is added to a [meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta) for search engine optimization. |
| jtcd.faviconRelPath | String | ./favicon.ico | Value must be the relative path of the file from the root of the site.<br/><br/> If defined, the file is used as the favicon.

##### Header
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.logoRelPath | String | ./logo.svg |  Value must be the relative path of the file from the root of the site.<br/><br/> If defined, the file is used as the logo.
| jtcd.websiteName | String | null | If defined and `jtcd.logoRelPath` is undefined or invalid, the string is used as the [`alt`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) text for the logo.
| jtcd.disableSearch | Boolean | false | If true, the search box is removed from the page's header.

##### Left Menu
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.disableLeftMenu | Boolean | false | If true, the left menu is removed from the page. |

##### Right Menu
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.disableRightMenu | Boolean | false | If true, the right menu is removed from the page. |
| jtcd.disableEditArticle | Boolean | false | If true, the edit article link is removed from the page's right menu. |

##### Search
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.includeInSearchIndex | Boolean | true | If true, the page's article is included in the search index. |
| jtcd.searchIndexSnippetLength | Integer | 500 | Length of the page's article snippet in the search index. |

##### Miscellaneous
| Option  | Type | Default Value | Notes |
| --------- | ---- | ------------- | ----- |
| jtcd.pageID | String | null | If defined, the string is used as the ID of the html element of the page. This facilitates custom page specific styles and scripts. | 

### Overriding BasicBlog
DocFx themes are simply directories containing resources such as [Mustache templates](https://mustache.github.io/mustache.5.html), stylesheets and scripts. If more than one theme is specified when building a DocFx project, resources from all of the themes are combined into a single theme. Resources from latter themes take precedence. For example, your *blog/docfx.json* has the following `template` property (the property should really be named `theme`, however, DocFx themes were referred to as templates initially):

```
"template": [
    "./node_modules/jeremytcd-docfx-themes-basicblog/dist/theme",
    "./src/customizations"
]
```

Resources from *blog/src/customizations* take precedence. *blog/src/customizations* is essentially a theme for overriding files in BasicBlog. It has several intended extensibility points:

* *blog/src/customizations/styles/customStyles.css* can be used to overwrite BasicBlog styles.
* *blog/src/customizations/styles/customScript.js* can be used to overwrite BasicBlog scripts.
* Mustache templates can be placed in *blog/src/customizations/partials* to overwrite BasicBlog Mustache templates.

#### Example: Overriding colors
1. Ensure that you are serving your blog in watch mode. Navigate to *localhost:3000*.
2. Open *blog/src/customizations/styles/customStyles.css* in a text editor or IDE of your choice. Replace its contents with the following text:

   ```css
   header {
       background-color: black;
   }
   footer {
       background-color: black;
   }
   ```

   Your browser will reload the page automatically. Your header and footer will now be black. You can use this technique to customize your blog's color scheme and more.
   
### Creating Articles
TODO

## Publishing Your Blog
TODO

## Modifying BasicBlog
The sections above pertain to using BasicBlog as is. You might want to modify BasicBlog to create your own theme instead. This section covers all you need to know to get started. 

### Building BasicBlog
1. Fork this repository. 
2. Clone your fork:
 
   ```
   C:\your\path> git clone https://github.com/YourName/DocFx.Themes.BasicBlog.git
   ```
   
3. Install BasicBlog's yarn dependencies by running the following command in the  *docfx-themes-basicblog* directory:
    
   ```
   C:\your\path\docfx-themes-basicblog> yarn install
   ```
    
   This command generates a directory named *node_modules*. *node_modules* contains BasicBlog's Yarn dependencies.
    
2. Build BasicBlog by running one of the following commands:

   ```
   C:\your\path\docfx-themes-basicblog> yarn run build-dev
   ```
   
   or
   
   ```
   C:\your\path\docfx-themes-basicblog> yarn run build-production
   ```
    
   Both of these commands generate a directory named *dist*. *dist* contains everything that will be included in the BasicBlog Yarn package. Note that when running `build-production`, some files will be minified and some file names will be appended with hashes to help with caching. Production mode is slower and should not be used while developing.
    
### Serving BasicBlog in watch mode
    
1. To serve BasicBlog in watch mode, a blog project is required so that there is content to display (articles, categories etc). By default, the blog project *docfx-themes-basicblog/examples/blog* is served when you run the following command in *docfx-themes-basicblog*, using an administrator shell:
 
   ```   
   yarn run serve-dev [-- [-d <blog project directory>] [-l debug]]
   
   # Append `-- -d <blog project directory>` to use a blog project other than docfx-themes-basicblog/examples/blog. 
   # Append `-- -l debug` to view debug level ouput.
   ```
   
   The site should be available at port 8080 (navigate to *localhost:8080* to view it). Changes to the contents of the following directories in *docfx-themes-basicblog* will trigger a DocFx rebuild and a page reload: 
   - *fonts*
   - *misc*
   - *plugins*
   - *templates*
   - *examples/blog/src*
   - *examples/blog/docfx.json*
   - *examples/blog/package.json*
   
   Changes to the contents of the following directories will trigger a webpack incremental build and a page reload:
   - *scripts*
   - *styles*
   
#### Example: Editing scripts in watch mode
1. Navigate to *localhost:8080/articles/allArticles.html*.
2. Edit the following line in *docfx-themes-basicblog/scripts/salComponent.ts*:
    
   ```ts
   class SalComponent extends Component {
       ...
       protected setup(): void {
           let numPerPage = 2; // Change from 5 to 2
           ...
       }
   }
   ```
    
   Your browser should reload the page automatically. Instead of displaying 4 articles, your "All Articles" page should display 2 articles and a link to view the other two.

## Packing BasicBlog

Pack BasicBlog (or your modified version of it) by running the following command in the *docfx-themes-basicblog* directory:
    
```
C:\your\path\docfx-themes-basicblog> yarn pack
```
    
A gzip (*.tgz*) folder will be generated. 
   
To use your package locally, in your blog project directory, run the following command:
    
```
C:\your\path\blog> yarn remove jeremytcd-docfx-themes-basicblog
```
    
Then add your customized package using the following command:
    
```
C:\your\path\blog> yarn add "C:/your/path/jeremytcd-docfx-themes-basicblog-v0.0.0.tgz"    
```
    
Don't forget to clear your Yarn cache or increment the version number in *project.json* if you repack the package.

## Alternatives
DocFx is geared toward generating documentation sites. There are however, some pros for using DocFx to generate your blog:
- You can write plugins using .Net languages.
- DocFx makes it easy to insert code from .Net projects into your articles.
- You get to familiarize yourself with a great tool for documenting .Net projects.

If you are looking for an alternative platform, the following are quality alternatives:  
- [Jekyll](https://jekyllrb.com/)
- [Hugo](https://gohugo.io/)

## Further Reading
Familiarity with these technologies will make using BasicBlog easier:
- [DocFx](https://dotnet.github.io/docfx/)
- [Yaml](http://yaml.org/spec/1.2/spec.html)
 
Additionally, if you intend to modify BasicBlog to create your own theme, these 
technologies will be of interest:  
- [Typescript](https://www.typescriptlang.org/)  
- [Sass/Scss](http://sass-lang.com/)
- [Mustache](https://mustache.github.io/mustache.5.html)
- [Webpack](https://webpack.js.org/)
- [Yarn](https://yarnpkg.com/en/)  
- [Node](https://nodejs.org/en/)
- [Lunr](https://lunrjs.com/)

## Related Projects
TODO
 
## Contributions
Contributions are welcome! If you are looking for existing issues to work on, they can be found [here](https://github.com/JeremyTCD/DocFx.Themes.BasicBlog/labels/help%20wanted).

## License
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/JeremyTCD/JeremyTCD.github.io/dev/License.txt)  
