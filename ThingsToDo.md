# Document Serving
## Using The mimo-website package
### Scripts
 The mimo project must have the following tsconfig options:
- compilerOptions.paths must have an entry aliasing `mimo-website/*` to `node_modules/mimo-website/dist/scripts/*`.
### Styles
Styles should be referenced directly from `node_modules/mimo-website/styles`.

## Using The mimo-website repository
Using `yarn run serve <mimo project>` in the mimo-website repository, the source code in the mimo-website repository can be used on any mimo project.
### Scripts
 The mimo project must have the following tsconfig options:
- compilerOptions.typeRoots must contain the node_modules/@types of the mimo repository and the mimo project being served. 
- compilerOptions.paths must have an entry aliasing `mimo-website/*` to `<mimo repository>/scripts/*`.
- compilerOptions.include must contain the path pointing to `<mimo repository>/scripts/typings/*.d.ts`.
### Styles
webpack.config automatically resolves scss imports to `__dirname/../styles`. Note that while serving a mimo
project using the mimo-website repository's source files, intellisense will have no knowledge of the 
mimo-website repository's files.

# Document Extending Mimo
## Scripts
Host automatically registers default services. The container with default services can be obtained using 
`Host.getContainer()`. Mimo can be extended and modified by adding and overriding services. `Host.run()` 
calls the lifecycle methods in components and global services. 

## Styles
Mimo exports a bunch of scss files. These can be imported through the consolidation file `node_modules/mimo-website/dist/styles/mimo`
or they can be imported individually. One of these files contains scss constants. These constants can be 
overriden by declaring scss variables with the same names before importing mimo's constants.