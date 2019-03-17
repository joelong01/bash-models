import { ParameterModel } from "./ParameterModel";

//
//  the state parameters should be the same names as the properties in the scriptModel

export interface IScriptModelState {
    JSON: string;
    bashScript: string;
    Errors: IErrorMessage[];
    scriptName: string;
    description: string;
    parameters: ParameterModel[];
    inputJson: string;
    debugConfig: string;


}

export interface IParameterState {
    default: string;
    description: string;
    longParameter: string;
    requiresInputString: boolean;
    requiredParameter: boolean;
    shortParameter: string;
    variableName: string;
    valueIfSet: string;
    collapsed: boolean;
    type: ParameterType;
}

export type NotifyScriptModelChanged = (newState: Partial<IScriptModelState>) => void;

export type OnErrorMessage = (message: IErrorMessage) => void;
export interface IErrorMessage {
    severity: "warn" | "error" | "info";
    message: string;
    key: string;
    Parameter?: ParameterModel
}
export interface IBuiltInParameterName {
    Create?: string,
    Verify?: string,
    Delete?: string,
    Logging?: string,
    InputFile?: string,
    Verbose?: string
}

export enum ParameterType {
    Create = "Create",
    Verify = "Verify",
    Delete = "Delete",
    Logging = "Logging",
    InputFile = "InputFile",
    Verbose = "Verbose",
    Custom = "Custom"
}

export enum ValidationOptions {
    AllowBlankValues = 1,
    // tslint:disable-next-line
    ClearErrors = 1 << 2,
    // tslint:disable-next-line
    ValidateOnly = 1 << 3,
    // tslint:disable-next-line
    Growl = 1 << 4
}

//
//  used when parsing a bash script
export interface IParseState {
    ScriptName: string;
    Description: string;
    Parameters: ParameterModel[];
    ParseErrors: IErrorMessage[];
    UserCode: string;
    builtInParameters: { [key in keyof IBuiltInParameterName]: ParameterModel }; // this isn't in the this.state object because it doesn't affect the UI
}

