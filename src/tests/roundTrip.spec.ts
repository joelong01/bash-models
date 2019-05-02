import { ScriptModel } from "../scriptModel"
import { expect } from 'chai';
import 'mocha';
import { ParameterType, IScriptModelState, IErrorMessage } from "../commonModel";
import "./customParameters.spec"
const sm: ScriptModel = new ScriptModel();
console.log("testing round trip")
describe('generate script', () => {
    sm.addParameter(ParameterType.Create);
    sm.addParameter(ParameterType.Verify)
    sm.addParameter(ParameterType.Delete)
    sm.addParameter(ParameterType.Verbose)
    sm.addParameter(ParameterType.InputFile)
    sm.addParameter(ParameterType.Logging)
    sm.addParameter(ParameterType.Custom);
    expect(sm.parameters.length).to.equal(7);
});

console.log ("testing parsing of built in parameters")
const smNew: ScriptModel = new ScriptModel();
describe('parse script', () => {
    smNew.parseBash(sm.bashScript);
    expect(sm.parameters.length).to.equal(7);  
    expect (sm.BuiltInParameters.Create).not.undefined;
    expect (sm.BuiltInParameters.Verify).not.undefined;
    expect (sm.BuiltInParameters.Delete).not.undefined;
    expect (sm.BuiltInParameters.Verbose).not.undefined;
    expect (sm.BuiltInParameters.InputFile).not.undefined;
    expect (sm.BuiltInParameters.Logging).not.undefined;
});
