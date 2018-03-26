export default interface GlobalService {
    // Called when script bundle first executes
    setupImmediate(): void;

    // Called when document has been parsed but not all resources have been downloaded. 
    // No logic that requires dimensions of elements should be run here since resources like fonts may not be loaded yet.
    setupOnDomContentLoaded(): void;

    // Called when document has been parsed and all resources have been downloaded. 
    // Logic that requires dimensions of elements should be run here since all resources have been loaded.
    setupOnLoad(): void;
}
