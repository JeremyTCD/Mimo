import { injectable } from 'inversify';
import Component from "./component";

// Root components correspond to the direct children of <body> and <div id="core">. 
// These components are typically independent of each other and are typically the roots of logical groups of interelated sub-components.
@injectable()
export default abstract class RootComponent implements Component {
    private childComponents: Component[];

    protected addChildComponents(...components: Component[]): void {
        this.childComponents = components;
    }

    protected childComponentsSetupImmediate(): void {
        for (let i = 0; i < this.childComponents.length; i++) {
            this.childComponents[i].setupImmediate();
        }
    }

    protected childComponentsSetupOnDomContentLoaded(): void {
        for (let i = 0; i < this.childComponents.length; i++) {
            this.childComponents[i].setupOnDomContentLoaded();
        }
    }

    protected childComponentsSetupOnLoad(): void {
        for (let i = 0; i < this.childComponents.length; i++) {
            this.childComponents[i].setupOnLoad();
        }
    }

    abstract setupImmediate(): void;

    abstract setupOnDomContentLoaded(): void;

    abstract setupOnLoad(): void;

    abstract enabled(): boolean;
}
