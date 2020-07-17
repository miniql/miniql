import * as moment from "moment";

export class ExampleClass {

    public test(): void {
        console.log("Test: " + moment().format("YYYY-DD-MM"));
    }

    public returnsTrue(): boolean {
        return true;
    }

}

//TODO: Code for your reusable code module goes here.