abstract class Component {
    public initialize(): void {
        if (this.validDomElementExists()) {
            this.setup();
            this.registerListeners();
        }
    }

    protected abstract validDomElementExists(): boolean;
    protected abstract setup(): void;
    protected abstract registerListeners(): void;
}

export default Component;