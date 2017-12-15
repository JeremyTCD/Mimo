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
* [Creating Your Blog Using BasicBlog](#creating-your-blog-using-basicblog) 
  * [Building and Serving Your Blog](#building-and-serving-your-blog)  
  * [Serving Your Blog in Watch Mode](#serving-your-blog-in-watch-mode)  
    * [Example: Adding an article in watch mode](#example-adding-an-article-in-watch-mode)
  * [Configuring Your Blog](#configuring-your-blog)
  * [Overriding BasicBlog](#overriding-basicblog)  
    * [Example: Overriding colors](#example-overriding-colors)
* [Publishing Your Blog](#publishing-your-blog)
* [Modifying BasicBlog](#modifying-basicblog)  
  * [Building BasicBlog](#building-basicblog)
  * [Serving BasicBlog in watch mode](#serving-basicblog-in-watch-mode)
    * [Example: Editing scripts in watch mode](#editing-scripts-in-watch-mode)
* [Packing BasicBlog](#packing-basicblog)
* [Alternatives](#alternatives)  
* [Further Reading](#further-reading)  
* [Things To Do](#things-to-do)  
* [License](#license)

## Summary
BasicBlog is a minimalist [DocFx](https://dotnet.github.io/docfx/) blog theme. It is based on [docs.microsoft.com](https://docs.microsoft.com/en-us/dotnet/standard/get-started) and the [default DocFx theme](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html).  

Features:

- Page with list of articles sorted by date.
- Cient side search. Search results contain article snippets.
- A menu displaying articles by category.
- Watch mode (explained [here](#serving-your-blog-in-watch-mode)). Displays changes in real time as you edit your blog.
- Optional article comments powered by Disqus.
- Optional Google analytics.
- Optional Adsense ads.
- Easy to modify:  
	- Scripts and styles are organized by component.
	- Logic is mostly written in Typescript.
	- Styles are mostly written in Scss.
	- Webpack powered watch mode (explained [here](#serving-basicblog-in-watch-mode)). Displays changes in real time as you modify BasicBlog. 

## Prerequisites
Install the following command line tools if you don't already have them:
1. [Yarn](https://yarnpkg.com/lang/en/docs/install/), the frontend/javascript package manager used to distribute BasicBlog.
2. [DocFx](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html#2-use-docfx-as-a-command-line-tool) command line tool.
3. [MSBuild](https://www.visualstudio.com/downloads/#other) command line tool (comes with "Build Tools for Visual Studio 2017"). 

## Creating Your Blog Using BasicBlog
### Building and Serving Your Blog
1. Clone this repository:
 
   ```
   C:\any\path> git clone https://github.com/JeremyTCD/DocFx.Themes.BasicBlog.git
   ```
   
2. Copy *docfx-themes-basicblog/examples/blog* to a new location. 
   
   The *blog* directory is a quickstart template. It has the following structure: 

   ```
   |-- blog
       |-- src
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
   |-- node_modules
       |-- ...
       |-- jeremytcd-docfx-themes-basicblog
           |-- dist
               |-- theme
               |-- tools
           |-- ...
       |-- ...
   ```
   
   The *theme* directory is the BasicBlog DocFx theme. Note that it was not necessary to specify what you were installing when you ran `yarn install` because *package.json* is preconfigured with BasicBlog as a dependency.

4. Build your blog by running the following command in *blog*, using an administrator shell: 
    
   ```
   C:\your\path\blog> yarn run build
   ```
   
   This command runs `docfx build`, which generates a directory named *_site*. *_site* contains your static site. 

5. Serve your blog by running the following command in *blog*: 
    
   ```
   C:\your\path\blog> docfx serve _site
   ```
    
   To view your site, navigate to *localhost:8080* in your browser.
    
### Serving Your Blog in Watch Mode
Serve your blog in watch mode by running the following command in *blog*, using an 
administrator shell: 
    
```
C:\your\path\blog> yarn run serve [-- -l debug]

# Append "-- -l debug" to view debug level output.
```

This command runs `docfx build`, serves the site (on port 3000 by default - navigate to *localhost:3000* in your browser to view it) and starts watching *blog/src*. Any change to *blog/src*'s contents causes `docfx build` to run again and reloads the page.

Note that DocFx has to rebuild the entire static site whenever changes are made. This is because DocFx has no built-in watch feature. At the time of writing, DocFx takes about 2.5 seconds to rebuild *docfx-themes-basicblog/examples/blog*. That is pretty slow, but beats manually running `docfx build` and refreshing the page on every change.
        
#### Example: Adding an article in watch mode
1. Navigate to *localhost:3000/articles/all.html* in your browser.
2. In *blog/src/content/articles*, duplicate *exampleArticle4.md*. Rename the new file to *myFirstArticle.md*.
3. Open *myFirstArticle.md* in a text editor or IDE of your choice. Amend the following two lines near the beggining of the file:
    
   ```yaml
   ---
   title: My First Article # Inserted into the <title> html element
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
   ```
   
   Your browser should reload the page automatically. The menu on the left should contain a new category named *My First Category*. This category should contain a new article named *My First Article*.

   Refer to the [DocFx documentation](https://dotnet.github.io/docfx/tutorial/docfx_getting_started.html) for an explanation on DocFx flavoured markdown, toc files etc.

### Configuring Your Blog
TODO
#### Article Scope
TODO
#### Global Scope
TODO

### Overriding BasicBlog
DocFx themes are simply directories containing resources such as [Mustache templates](https://mustache.github.io/mustache.5.html), stylesheets and scripts. If more than one theme is specified when building a DocFx project, resources from all of the themes are combined into a single theme. Resources from latter themes take precedence. For example, your *blog/docfx.json* has the following `template` property (the property should really be named `theme`, however, DocFx themes were referred to as templates initially):

```
"template": [
    "./node_modules/jeremytcd-docfx-themes-basicblog/dist/theme",
    "./src/customizations"
]
```

Resources from *blog/src/customizations* take precedence. Essentially, *blog/src/customizations* is a custom theme for overriding files in BasicBlog. It has several intended extensibility points:

* *blog/src/customizations/styles/customStyles.css* can be used to overwrite BasicBlog styles.
* Mustache templates can be placed in *blog/src/customizations/partials* to overwrite BasicBlog Mustache templates.

#### Example: Overriding colors
1. Ensure that you are serving your blog in watch mode. In your browser, navigate to *localhost:3000*.
2. Open *blog/src/customizations/styles/customStyles.css* in a text editor or IDE of your choice. Replace its contents with the following text:

   ```css
   header {
       background-color: black;
   }
   footer {
       background-color: black;
   }
   ```

   Your browser should reload the page automatically. Your header and footer should now be black. You can use this technique to customize your blog's color scheme and more.
   
## Publishing Your Blog
TODO  
I recommend [Github Pages](https://pages.github.com/).

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
    
1. To serve BasicBlog in watch mode, a blog project is required so that there is content to display (articles, categories etc). By default, *docfx-themes-basicblog/examples/blog* is served locally when you run the following command in *docfx-themes-basicblog*, using an administrator shell:
 
   ```   
   yarn run serve-dev [-- [-d <blog project directory>] [-l debug]]
   
   # Append `-- -d <blog project directory>` to use a blog project other than *docfx-themes-basicblog/examples/blog*. 
   # Append `-- -l debug` to view debug level ouput.
   ```
   
   The site should be available at port 8080 (navigate to *localhost:8080* in your browser to view it). Changes to the contents of the following directories in *docfx-themes-basicblog* will trigger a DocFx rebuild and a page reload: 
   - *fonts*
   - *misc*
   - *plugins*
   - *templates*
   - *examples/blog/src*
   
   Changes to the contents of the following directories will trigger a webpack incremental build and a page reload:
   - *scripts*
   - *styles*
   
#### Example: Editing scripts in watch mode
1. Navigate to *localhost:8080/articles/all.html* in your browser.
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
    
   Your browser should reload the page automatically. Instead of displaying 4 articles, your "all articles" page should display 2 articles and a link to view the other two.

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
    
Don't forget to clear your cache or increment the version number in *project.json* if you repack the package.

## Alternatives
DocFx is very much geared toward generating documentation sites. There are however, some pros for using DocFx to generate your blog:
- You can write plugins using .Net languages.
- DocFx makes it easy to insert code from .Net projects into your articles.
- You get to familiarize yourself with a great tool for documenting .Net projects.

If you are looking for a simpler blog or a platform with more templates to choose from, you can try the following platforms:  
- [Jekyll](https://jekyllrb.com/)
- [Hugo](https://gohugo.io/)

## Further Reading
Familiarity with these technologies will make using BasicBlog easier:
- [DocFx](https://dotnet.github.io/docfx/)
- [Yaml](http://yaml.org/spec/1.2/spec.html)
 
Additionally, if you intend to modify BasicBlog to create your own theme, these 
technologies may be of interest:  
- [Typescript](https://www.typescriptlang.org/)  
- [Sass/Scss](http://sass-lang.com/)
- [Mustache](https://mustache.github.io/mustache.5.html)
- [Webpack](https://webpack.js.org/)
- [Yarn](https://yarnpkg.com/en/)  
- [Node](https://nodejs.org/en/)
- [Lunr](https://lunrjs.com/)
 
## Contributions
Contributions are welcome! If you are looking for existing issues to work on, they can be found [here](https://github.com/JeremyTCD/DocFx.Themes.BasicBlog/labels/help%20wanted).

## License
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/JeremyTCD/JeremyTCD.github.io/dev/License.txt)  
