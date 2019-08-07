﻿export default interface GlobalService {
    // DomInteractive: marks the point when the browser has finished parsing all of the HTML and DOM construction is complete.
    // Note: since mimo loads the script bundle with defer, all scripts run after DomInteractive.
    setupOnDomInteractive(): void;

    // Called when document has been parsed and all resources have been downloaded. 
    // Logic that requires dimensions of elements should be run here since all resources have been loaded.
    setupOnLoad(): void;
}
