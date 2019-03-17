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
