/*
 * Augmentations to existing definition files. The official documentation suggests that it is easy to augment namespaces,
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html. However it isn't so straight forward, 
 * https://github.com/Microsoft/TypeScript/issues/17736
 */

export {} // ensure this is a module

declare module "lunr" {
    function generateStopWordFilter(stopWords: string[]) : any;    
}
