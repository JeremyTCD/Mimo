abstract class Component {
    public onDomContentLoaded(): void {
        if (this.validDomElementExists()) {
            this.setupOnDomContentLoaded();
            this.registerListeners();
        }
    }

    public onLoad(): void {
        if (this.validDomElementExists()) {
            this.setupOnLoad();
        }
    }

    // Called when document has been parsed but not all resources have been downloaded. 
    // No logic that requires dimensions of elements should be run here since resources like fonts may not be loaded yet.
    protected abstract setupOnDomContentLoaded(): void;

    // Called when document has been parsed and all resources have been downloaded. 
    // Logic that requires dimensions of elements should be run here since all resources have been loaded.
    protected abstract setupOnLoad(): void;

    protected abstract validDomElementExists(): boolean;

    protected abstract registerListeners(): void;
}

export default Component;